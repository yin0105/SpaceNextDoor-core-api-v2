import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { PlatformFeature } from '../../graphql.schema';
import { PlatformFeatureCategoryModel } from '../../platform/features/categories/feature-category.model';
import { PlatformFeatureModel } from '../../platform/features/feature.model';
import { BOOKING_SPACE_FEATURE_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingSpaceFeatureModel } from './booking-space-feature.model';

@Injectable()
export class BookingSpaceFeatureService {
  constructor(
    @Inject(BOOKING_SPACE_FEATURE_REPOSITORY)
    private readonly bookingSpaceFeatureEntity: typeof BookingSpaceFeatureModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingSpaceFeatureService.name);
  }

  /**
   * Create / Delete booking space feature entires
   */
  async upsert(
    bookingId: number,
    featureIds: number[],
    options?: {
      t?: Transaction;
    },
  ): Promise<any> {
    try {
      const promises = [];
      const bookingSpaceFeatures = await this.bookingSpaceFeatureEntity.findAll(
        {
          where: { booking_id: { [Op.eq]: bookingId } },
        },
      );
      const bookingSpaceFeaturePromises = featureIds
        .filter(
          (featureId) =>
            !bookingSpaceFeatures.find(
              (bookingSpaceFeature) =>
                bookingSpaceFeature.feature_id === featureId,
            ),
        )
        .map((featureId) =>
          this.bookingSpaceFeatureEntity.create(
            {
              booking_id: bookingId,
              feature_id: featureId,
            },
            { transaction: options?.t },
          ),
        );
      promises.push(bookingSpaceFeaturePromises);
      promises.push(
        this.bookingSpaceFeatureEntity.destroy({
          where: {
            booking_id: { [Op.eq]: bookingId },
            feature_id: { [Op.notIn]: featureIds },
          },
          transaction: options?.t,
        }),
      );

      return await Promise.all(promises);
    } catch (error) {
      this.logger.error('Upsert Space-Feature Error: ', error?.stack);

      throw error;
    }
  }
  async getByBookingId(id: number): Promise<PlatformFeature[]> {
    const bookingSpaceFeatures = await this.bookingSpaceFeatureEntity.findAll({
      include: [
        {
          model: PlatformFeatureModel,
          include: [
            {
              model: PlatformFeatureCategoryModel,
            },
          ],
        },
      ],
      where: {
        booking_id: { [Op.eq]: id },
      },
    });
    return (bookingSpaceFeatures.map(
      (bookingSpaceFeature) => bookingSpaceFeature.feature,
    ) as undefined) as PlatformFeature[];
  }
}
