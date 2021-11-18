import { Inject, Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';

import { PlatformFeature } from '../../graphql.schema';
import { PlatformFeatureCategoryModel } from '../../platform/features/categories/feature-category.model';
import { PlatformFeatureModel } from '../../platform/features/feature.model';
import { BOOKING_SITE_FEATURE_REPOSITORY } from '../../shared/constant/app.constant';
import { BookingSiteFeatureModel } from './booking-site-feature.model';

@Injectable()
export class BookingSiteFeatureService {
  constructor(
    @Inject(BOOKING_SITE_FEATURE_REPOSITORY)
    private readonly bookingSiteFeatureEntity: typeof BookingSiteFeatureModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingSiteFeatureService.name);
  }

  /**
   * Create / Delete booking site feature entires
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
      const bookingSiteFeatures = await this.bookingSiteFeatureEntity.findAll({
        where: { booking_id: { [Op.eq]: bookingId } },
      });
      const bookingSiteFeaturePromises = featureIds
        .filter(
          (featureId) =>
            !bookingSiteFeatures.find(
              (bookingSiteFeature) =>
                bookingSiteFeature.feature_id === featureId,
            ),
        )
        .map((featureId) =>
          this.bookingSiteFeatureEntity.create(
            {
              booking_id: bookingId,
              feature_id: featureId,
            },
            { transaction: options?.t },
          ),
        );
      promises.push(bookingSiteFeaturePromises);
      promises.push(
        this.bookingSiteFeatureEntity.destroy({
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
    const bookingSiteFeatures = await this.bookingSiteFeatureEntity.findAll({
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
    return (bookingSiteFeatures.map(
      (bookingSiteFeature) => bookingSiteFeature.feature,
    ) as undefined) as PlatformFeature[];
  }
}
