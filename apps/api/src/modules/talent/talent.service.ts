import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  TalentProfile,
  TalentProfileDocument,
} from "./schemas/talent-profile.schema";
import { CreateTalentProfileDto } from "./dto/create-talent-profile.dto";
import {
  ApprovalStatus,
  AvailabilityStatus,
  TalentFilters,
  PAGINATION,
} from "@talent-casting/shared";

@Injectable()
export class TalentService {
  constructor(
    @InjectModel(TalentProfile.name)
    private talentModel: Model<TalentProfileDocument>,
  ) {}

  private generateSlug(name: string, id: string): string {
    return `${name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}-${id.slice(-6)}`;
  }

  async createOrUpdateProfile(
    userId: string,
    dto: CreateTalentProfileDto,
  ): Promise<TalentProfileDocument> {
    const existing = await this.talentModel.findOne({ userId });
    if (existing) {
      Object.assign(existing, dto);
      return existing.save();
    }

    const profile = await this.talentModel.create({ ...dto, userId });
    profile.slug = this.generateSlug(dto.fullName, profile._id.toString());
    return profile.save();
  }

  async getMyProfile(userId: string): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findOne({ userId });
    if (!profile)
      throw new NotFoundException(
        "Profile not found. Please create your profile first.",
      );
    return profile;
  }

  async getPublicProfile(
    slug: string,
    _viewerId?: string,
  ): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findOne({
      slug,
      approvalStatus: ApprovalStatus.APPROVED,
      isPublic: true,
    });
    if (!profile) throw new NotFoundException("Talent not found");

    // Increment view count (fire-and-forget)
    this.talentModel
      .findByIdAndUpdate(profile._id, { $inc: { profileViews: 1 } })
      .exec();

    return profile;
  }

  async getProfileById(profileId: string): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findById(profileId);
    if (!profile) throw new NotFoundException("Profile not found");
    return profile;
  }

  async browseMarketplace(filters: TalentFilters) {
    const page = filters.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(
      filters.limit || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT,
    );
    const skip = (page - 1) * limit;

    const query: any = {
      approvalStatus: ApprovalStatus.APPROVED,
      isPublic: true,
    };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.category) query.categories = filters.category;
    if (filters.gender) query.gender = filters.gender;
    if (filters.city) query.city = { $regex: filters.city, $options: "i" };
    if (filters.country) query.country = filters.country;
    if (filters.experience) query.experience = filters.experience;
    if (filters.availability) query.availability = filters.availability;
    if (filters.language)
      query["languages.language"] = { $regex: filters.language, $options: "i" };
    if (filters.ageMin || filters.ageMax) {
      const now = new Date();
      query.dateOfBirth = {};
      if (filters.ageMin) {
        query.dateOfBirth.$lte = new Date(
          now.getFullYear() - filters.ageMin,
          now.getMonth(),
          now.getDate(),
        );
      }
      if (filters.ageMax) {
        query.dateOfBirth.$gte = new Date(
          now.getFullYear() - filters.ageMax,
          now.getMonth(),
          now.getDate(),
        );
      }
    }

    const [items, total] = await Promise.all([
      this.talentModel
        .find(query)
        .select(
          "fullName slug profilePhoto gender city country categories experience availability isVerified isFeatured",
        )
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.talentModel.countDocuments(query),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateAvailability(
    userId: string,
    availability: AvailabilityStatus,
  ): Promise<void> {
    await this.talentModel.findOneAndUpdate({ userId }, { availability });
  }

  async updateProfilePhoto(
    userId: string,
    asset: { url: string; publicId: string },
  ): Promise<void> {
    await this.talentModel.findOneAndUpdate(
      { userId },
      { profilePhoto: asset },
    );
  }

  async updateVideo(
    userId: string,
    videoType: "introVideo" | "sceneVideo",
    asset: { url: string; publicId: string },
  ): Promise<void> {
    await this.talentModel.findOneAndUpdate(
      { userId },
      {
        [videoType]: { ...asset, status: "pending" },
      },
    );
  }

  async addPortfolioVideo(
    userId: string,
    asset: { url: string; publicId: string; title: string },
  ): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findOne({ userId });
    if (!profile) throw new NotFoundException("Profile not found");
    if (profile.portfolioVideos.length >= 5) {
      throw new BadRequestException(
        "Maximum 5 portfolio videos allowed on Pro plan",
      );
    }
    profile.portfolioVideos.push({ ...asset, status: "pending" } as any);
    return profile.save();
  }

  async removePortfolioVideo(
    userId: string,
    videoPublicId: string,
  ): Promise<void> {
    await this.talentModel.findOneAndUpdate(
      { userId },
      { $pull: { portfolioVideos: { publicId: videoPublicId } } },
    );
  }

  async getPendingProfiles(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.talentModel
        .find({ approvalStatus: ApprovalStatus.PENDING })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 1 }),
      this.talentModel.countDocuments({
        approvalStatus: ApprovalStatus.PENDING,
      }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async approveProfile(profileId: string): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findByIdAndUpdate(
      profileId,
      { approvalStatus: ApprovalStatus.APPROVED, rejectionReason: null },
      { new: true },
    );
    if (!profile) throw new NotFoundException("Profile not found");
    return profile;
  }

  async rejectProfile(
    profileId: string,
    reason: string,
  ): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findByIdAndUpdate(
      profileId,
      { approvalStatus: ApprovalStatus.REJECTED, rejectionReason: reason },
      { new: true },
    );
    if (!profile) throw new NotFoundException("Profile not found");
    return profile;
  }

  async toggleFeatured(
    profileId: string,
    isFeatured: boolean,
  ): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findByIdAndUpdate(
      profileId,
      { isFeatured },
      { new: true },
    );
    if (!profile) throw new NotFoundException("Profile not found");
    return profile;
  }

  async toggleVerified(
    profileId: string,
    isVerified: boolean,
  ): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findByIdAndUpdate(
      profileId,
      { isVerified },
      { new: true },
    );
    if (!profile) throw new NotFoundException("Profile not found");
    return profile;
  }

  async getStats() {
    const [total, approved, pending, featured] = await Promise.all([
      this.talentModel.countDocuments(),
      this.talentModel.countDocuments({
        approvalStatus: ApprovalStatus.APPROVED,
      }),
      this.talentModel.countDocuments({
        approvalStatus: ApprovalStatus.PENDING,
      }),
      this.talentModel.countDocuments({ isFeatured: true }),
    ]);
    return { total, approved, pending, featured };
  }

  async getPendingMedia(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const pendingConditions = [
      { "introVideo.status": "pending" },
      { "sceneVideo.status": "pending" },
      { "portfolioVideos.status": "pending" },
    ];
    const [items, total] = await Promise.all([
      this.talentModel
        .find({ $or: pendingConditions })
        .select(
          "fullName slug profilePhoto introVideo sceneVideo portfolioVideos approvalStatus",
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 1 }),
      this.talentModel.countDocuments({ $or: pendingConditions }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async approveMedia(
    profileId: string,
    mediaType: string,
    mediaIndex?: number,
  ): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findById(profileId);
    if (!profile) throw new NotFoundException("Profile not found");

    if (mediaType === "introVideo" && profile.introVideo) {
      profile.introVideo = { ...profile.introVideo, status: "approved" } as any;
    } else if (mediaType === "sceneVideo" && profile.sceneVideo) {
      profile.sceneVideo = { ...profile.sceneVideo, status: "approved" } as any;
    } else if (mediaType === "portfolioVideo" && mediaIndex !== undefined) {
      if (profile.portfolioVideos[mediaIndex]) {
        profile.portfolioVideos[mediaIndex] = {
          ...profile.portfolioVideos[mediaIndex],
          status: "approved",
        } as any;
        profile.markModified("portfolioVideos");
      }
    }
    return profile.save();
  }

  async rejectMedia(
    profileId: string,
    mediaType: string,
    reason: string,
    mediaIndex?: number,
  ): Promise<TalentProfileDocument> {
    const profile = await this.talentModel.findById(profileId);
    if (!profile) throw new NotFoundException("Profile not found");

    if (mediaType === "introVideo" && profile.introVideo) {
      profile.introVideo = {
        ...profile.introVideo,
        status: "rejected",
        rejectionReason: reason,
      } as any;
    } else if (mediaType === "sceneVideo" && profile.sceneVideo) {
      profile.sceneVideo = {
        ...profile.sceneVideo,
        status: "rejected",
        rejectionReason: reason,
      } as any;
    } else if (mediaType === "portfolioVideo" && mediaIndex !== undefined) {
      if (profile.portfolioVideos[mediaIndex]) {
        profile.portfolioVideos[mediaIndex] = {
          ...profile.portfolioVideos[mediaIndex],
          status: "rejected",
          rejectionReason: reason,
        } as any;
        profile.markModified("portfolioVideos");
      }
    }
    return profile.save();
  }
}
