import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhereOptions } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  CountriesFilter,
  CountriesResp,
  Country,
  LocationFilter,
  LocationsResp,
  LocationsSort,
  Pagination,
} from '../graphql.schema';
import {
  COUNTRY_REPOSITORY,
  SEQUELIZE_PROVIDER,
} from '../shared/constant/app.constant';
import { hasMoreRec } from '../shared/utils';
import { toSequelizeComparator } from '../shared/utils/graphql-to-sequelize-comparator';
import { CityModel } from './cities/city.model';
import { CountryModel } from './country.model';
import { DistrictModel } from './districts/district.model';
import { LandmarkModel } from './landmarks/landmark.model';

@Injectable()
export class CountryService {
  constructor(
    @Inject(SEQUELIZE_PROVIDER)
    private readonly sequelize: Sequelize,
    @Inject(COUNTRY_REPOSITORY)
    private readonly countryEntity: typeof CountryModel,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(CountryService.name);
  }

  async getById(id: number): Promise<Country> {
    const country = await this.countryEntity.findByPk(id);
    return (country as undefined) as Country;
  }

  async countries(
    pagination: Pagination,
    whereFilter: CountriesFilter,
  ): Promise<CountriesResp> {
    this.logger.setContext(CountryService.name);
    this.logger.log(
      `countries with payload where: ${JSON.stringify(whereFilter)}`,
    );

    let where: WhereOptions = {};
    if (whereFilter?.country) {
      const filter = {
        name_en: whereFilter.country,
      };
      where = toSequelizeComparator(filter);
    }

    const { count, rows } = await this.countryEntity.findAndCountAll({ where });

    const result = new CountriesResp();
    result.edges = rows;
    result.page_info = {
      ...pagination,
      total: count,
      has_more: hasMoreRec(count, pagination),
    };

    return result;
  }

  async searchLocations(
    sort: LocationsSort,
    where: LocationFilter,
  ): Promise<LocationsResp> {
    this.logger.setContext(CountryService.name);
    this.logger.log(`Searching with payload Where: ${JSON.stringify(where)}`);

    const getFilter = (query: any, key: string): any => {
      const fields = ['name_en', 'name_th', 'name_jp', 'name_kr'];
      return fields.reduce((obj, field) => {
        obj.push({ [`$${key}.${field}$`]: query });
        return obj;
      }, []);
    };
    const whereLoc: WhereOptions = toSequelizeComparator<LocationFilter>(where);

    let whereName;
    if (where?.name) {
      whereName = Sequelize.or(
        ...getFilter(whereLoc.name as any, 'cities'),
        ...getFilter(whereLoc.name as any, 'cities.districts'),
        ...getFilter(whereLoc.name, 'cities.districts.landmarks'),
      ) as any;
    }
    const searchResults = await this.countryEntity.findAll({
      include: [
        {
          model: CityModel,
          required: false,
          include: [
            {
              model: DistrictModel,
              include: [{ model: LandmarkModel, required: false }],
              required: false,
            },
          ],
        },
      ],
      where: Sequelize.and({ name_en: whereLoc.country }, whereName),
      order: [
        [{ model: CityModel, as: 'cities' }, 'id', 'ASC'],
        [
          { model: CityModel, as: 'cities' },
          { model: DistrictModel, as: 'districts' },
          'id',
          'ASC',
        ],
        [
          { model: CityModel, as: 'cities' },
          { model: DistrictModel, as: 'districts' },
          { model: LandmarkModel, as: 'landmarks' },
          'id',
          'ASC',
        ],
      ],
    });

    const result = new LocationsResp();

    result.edges = [];

    searchResults.forEach((search) => {
      search.cities.forEach((city) => {
        result.edges.push({
          country: search,
          city,
        });

        city.districts.forEach((district) => {
          result.edges.push({
            country: search,
            city,
            district,
          });

          district.landmarks.forEach((landmark) => {
            result.edges.push({
              country: search,
              city,
              district,
              landmark,
            });
          });
        });
      });
    });

    // Reversing the array because city -> district -> landmark. We need the results
    // from the nested hierarchy first as those might be the relevant ones.
    // result.edges.reverse();

    return result;
  }
}
