import { Inject, Injectable, Logger } from '@nestjs/common';
import { FindOptions, Op, WhereOptions } from 'sequelize';

import { CountryModel } from '../../countries/country.model';
import {
  Pagination,
  PlatformFeature,
  PlatformSpaceType,
  PlatformSpaceTypeResp,
  SpaceTypesFilter,
} from '../../graphql.schema';
import {
  COUNTRY_REPOSITORY,
  PLATFORM_SPACE_TYPE_REPOSITORY,
  SPACE_REPOSITORY,
} from '../../shared/constant/app.constant';
import { hasMoreRec, initPagination } from '../../shared/utils';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { PlatformFeatureCategoryModel } from '../features/categories/feature-category.model';
import { PlatformFeatureModel } from '../features/feature.model';
import { SpaceTypeFeatureModel } from './features/feature.model';
import { PlatformSpaceTypeModel } from './space-type.model';

@Injectable()
export class PlatformSpaceTypeService {
  constructor(
    @Inject(PLATFORM_SPACE_TYPE_REPOSITORY)
    private readonly spaceTypeEntity: typeof PlatformSpaceTypeModel,
    @Inject(COUNTRY_REPOSITORY)
    private readonly countryEntity: typeof CountryModel,
    @Inject(SPACE_REPOSITORY)
    private readonly spaceEntity: typeof SpaceModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PlatformSpaceTypeService.name);
  }

  async getById(id: number): Promise<PlatformSpaceType> {
    const result = await this.spaceTypeEntity.findByPk(id);
    return (result as undefined) as PlatformSpaceType;
  }

  async findAll(
    pagination: Pagination,
    where: SpaceTypesFilter = {},
  ): Promise<PlatformSpaceTypeResp> {
    pagination = initPagination(pagination);
    //
    const whereQry: WhereOptions = {};
    if (where?.unit) {
      whereQry.unit = {
        [Op.eq]: where.unit._eq,
      };
    }

    if (where?.size) {
      whereQry.size_from = {
        [Op.lte]: where.size._eq,
      };

      whereQry.size_to = {
        [Op.gte]: where.size._eq,
      };
    }

    // make country name from filter indexable
    let countryId = null;
    if (where?.country) {
      const country = await this.countryEntity.findOne({
        where: { name_en: where?.country._eq },
      });

      countryId = country?.id;
      whereQry.country_id = {
        [Op.eq]: country?.id,
      };
      delete where.country;
    }

    const options: FindOptions = {
      where: whereQry,
      include: [{ model: CountryModel }],
      limit: pagination.limit,
      offset: pagination.skip,
      order: [['size_from', 'asc']],
    };

    let { count, rows } = await this.spaceTypeEntity.findAndCountAll(options);

    // should return the largest one if not matched any
    if (where?.size?._eq && !rows.length) {
      const spaceType = await this.getBySize(where?.size._eq, countryId);
      count = 1;
      rows = [spaceType];
    }

    const result = new PlatformSpaceTypeResp();
    const edges = (rows as undefined) as PlatformSpaceType[];
    result.edges = edges;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  async getBySize(
    size: number,
    countryId?: number,
  ): Promise<PlatformSpaceTypeModel> {
    const where: WhereOptions = {
      size_from: {
        [Op.lte]: size,
      },
      size_to: {
        [Op.gte]: size,
      },
    };

    if (countryId) {
      where.country_id = {
        [Op.eq]: countryId,
      };
    }

    let spaceType = await this.spaceTypeEntity.findOne({
      where,
    });

    // if not found(means its larger than the largest one), get the largest one
    if (!spaceType) {
      const options: FindOptions = {
        order: [['size_to', 'DESC']],
      };

      if (countryId) {
        options.where = {
          country_id: countryId,
        };
      }
      spaceType = await this.spaceTypeEntity.findOne(options);
    }

    return spaceType;
  }

  async getFeatures(spaceTypeId: number): Promise<PlatformFeature[]> {
    const spaceType = await this.spaceTypeEntity.findByPk(spaceTypeId, {
      include: [
        {
          model: SpaceTypeFeatureModel,
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
        },
      ],
    });
    return spaceType.features.map(
      (feat) => (feat.feature as undefined) as PlatformFeature,
    );
  }
}
