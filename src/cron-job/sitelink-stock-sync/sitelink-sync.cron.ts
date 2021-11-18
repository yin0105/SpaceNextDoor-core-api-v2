import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { groupBy, sortBy } from 'lodash';

import { AppModule } from '../../app.module';
import { UserModule } from '../../auth/users/user.module';
import { UserService } from '../../auth/users/user.service';
import {
  FixedCountry,
  PlatformFeatureType,
  ProviderType,
  SiteStatus,
  SpaceSizeUnit,
  SpaceStatus,
  StockManagementType,
} from '../../graphql.schema';
import { PlatformFeatureModule } from '../../platform/features/feature.module';
import { PlatformFeatureService } from '../../platform/features/feature.service';
import { PropertyTypeModule } from '../../platform/property-types/property-type.module';
import { PropertyTypeService } from '../../platform/property-types/property-type.service';
import { PlatformSpaceTypeModule } from '../../platform/space-types/space-type.module';
import { PlatformSpaceTypeService } from '../../platform/space-types/space-type.service';
import { RabbitMQAppModule } from '../../rabbitmq/rabbitmq.module';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { SiteModule } from '../../sites/sites/site.module';
import { SiteService } from '../../sites/sites/site.service';
import { PriceModule } from '../../spaces/prices/price.module';
import { PriceService } from '../../spaces/prices/price.service';
import { SpaceFeatureModule } from '../../spaces/space-features/space-feature.module';
import { SpaceFeatureService } from '../../spaces/space-features/space-feature.service';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { SpaceModule } from '../../spaces/spaces/space.module';
import { SpaceService } from '../../spaces/spaces/space.service';
import { ISiteLinkByStore, ISiteLinkUnit, SiteLinkStore } from './interfaces';
import { SiteLinkConnector } from './site-link-connector';

// eslint-disable-next-line complexity
const siteLinkSyncCron = async (siteLinkStore: ISiteLinkByStore) => {
  const logger = new Logger('SiteLinkSyncCron');
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get<ConfigService>(ConfigService);
    const connector = new SiteLinkConnector(configService);
    const commissionPercent = configService.get(
      'app.siteLink.priceCommissionPercent',
    );
    const esKey = configService.get('app.rabbitmq.update_es_key');
    const sitesService = app
      .select(SiteModule)
      .get(SiteService, { strict: true });

    const userService = app
      .select(UserModule)
      .get(UserService, { strict: true });

    const spaceService = app
      .select(SpaceModule)
      .get(SpaceService, { strict: true });

    const featureService = app
      .select(PlatformFeatureModule)
      .get(PlatformFeatureService, { strict: true });

    const spaceFeatureService = app
      .select(SpaceFeatureModule)
      .get(SpaceFeatureService, { strict: true });

    const propertyTypeService = app
      .select(PropertyTypeModule)
      .get(PropertyTypeService, { strict: true });

    const spaceTypeService = app
      .select(PlatformSpaceTypeModule)
      .get(PlatformSpaceTypeService, { strict: true });

    const priceService = app
      .select(PriceModule)
      .get(PriceService, { strict: true });

    const rabbitMQService = app
      .select(RabbitMQAppModule)
      .get(RabbitMQService, { strict: true });

    logger.log('');
    logger.log('==============================================');
    logger.log('==============================================');
    logger.log(`SYNC FOR ${siteLinkStore.store_name}`);
    logger.log('==============================================');
    logger.log('==============================================');
    logger.log('');
    logger.log('Trying to login to sitelink...');

    // Get login cookie
    await connector.login(siteLinkStore);

    logger.log('Finding sites with third party site id...');
    logger.log('Finding sites with from sitelink...');
    // Get sites
    const [
      user,
      sitelinkSites,
      propertyType,
      spaceTypes,
      features,
    ] = await Promise.all([
      userService.findOrCreateByEmailPhone('help@spacenextdoor.com', ''),
      connector.getSites(),
      propertyTypeService.getOne({ name: 'commercial' }),
      spaceTypeService.findAll(
        { limit: 50, skip: 0 },
        { country: { _eq: siteLinkStore.country } },
      ),
      featureService.getByType(PlatformFeatureType.SPACE),
    ]);

    const thirdPartySiteIds = sitelinkSites.map((sitelinkSite) =>
      String(sitelinkSite.SiteId),
    );
    const sites = await sitesService.findAllThirdParty(thirdPartySiteIds);

    const sortedSpaceTypes = sortBy(spaceTypes.edges, (s) => s.size_from);
    const calcLengthFromArea = (area: number, width: number) =>
      parseFloat((area / width).toFixed(1));
    const featureMap = {
      HasAlarm: features.filter(
        (f) => (f.name_en || '').toLowerCase().indexOf('alarm') >= 0,
      )[0]?.id,
      HasClimate: features.filter(
        (f) => (f.name_en || '').toLowerCase().indexOf('climate') >= 0,
      )[0]?.id,
      HasPower: features.filter(
        (f) => (f.name_en || '').toLowerCase().indexOf('power') >= 0,
      )[0]?.id,
    };
    const getSpaceTypeId = (area: number) => {
      const id = (
        sortedSpaceTypes.filter(
          (t) => t.size_from <= area && t.size_to + 1 > area,
        )[0] || {}
      ).id;
      const lastType = sortedSpaceTypes[sortedSpaceTypes.length - 1];

      // If area is greater than the last available space type (XXL), we assign the last space type
      if (!id && lastType.size_to < area) {
        return lastType.id;
      }

      return id;
    };
    const getSpaceFeatures = (unit: ISiteLinkUnit): number[] => {
      const ids = [];
      if (unit.HasAlarm && featureMap.HasAlarm) {
        ids.push(featureMap.HasAlarm);
      }

      if (unit.HasClimate && featureMap.HasClimate) {
        ids.push(featureMap.HasClimate);
      }

      if (unit.HasPower && featureMap.HasPower) {
        ids.push(featureMap.HasPower);
      }

      return ids;
    };

    if (!user || !propertyType) {
      throw new Error('No host User found...');
    }

    logger.log(`Found ${sites.length} sites with third party site id`);
    logger.log(`Found ${sitelinkSites.length} sites from sitelink`);

    const sitesToBeCreated = sitelinkSites.filter(
      (sitelinkSite) =>
        !sites.filter(
          (site) =>
            parseInt(site.third_party_site_id, 10) === sitelinkSite.SiteId,
        ).length,
    );
    const newSites = [];

    for (const site of sitesToBeCreated) {
      try {
        newSites.push(
          await sitesService.create(
            {
              name: site.SiteName,
              rules_id: [],
              features_id: [],
              policies_id: [],
              provider_type: ProviderType.BUSINESS,
              status: SiteStatus.INACTIVE,
              images: [],
              third_party_site_id: String(site.SiteId),
              stock_management_type: StockManagementType.THIRD_PARTY,
              property_type_id: propertyType.id,
            },
            {
              user_id: user.id,
              source_site_name: siteLinkStore.store_name,
            },
          ),
        );
      } catch (e) {
        logger.error(
          `Error occurred while creating site: ${e.message}`,
          e.stack,
        );
      }
    }

    logger.log(`Created ${newSites.length} sites...`);

    const allSites = sites.concat((newSites as unknown) as typeof sites);

    // For each site Get list of spaces from site link using cookie
    for (const site of allSites) {
      try {
        logger.log('');
        logger.log(
          `${siteLinkStore.store_name} -> Finding spaces with third party unit id for site: ${site.id}`,
        );
        logger.log('');

        // In case the cookie was expired, Get login cookie again
        await connector.login(siteLinkStore);
        const [spaces, units] = await Promise.all([
          spaceService.findAllThirdPartyBySite(site.id),
          connector.getUnitsBySite(parseInt(site.third_party_site_id, 10)),
        ]);

        logger.log(
          `Fetching units from Site link for site: ${site.third_party_site_id}...`,
        );

        logger.log(
          `Found ${units.length} units from Site link for site: ${site.third_party_site_id}`,
        );

        logger.log(
          `Grouping units with UnitTypeId for 3rd party site: ${site.third_party_site_id}`,
        );

        const groupedUnitsByUnitTypeId = groupBy(
          units.filter((u) => u.Area !== 0),
          (o) => o.UnitTypeId,
        );
        const unitTypes = Object.keys(groupedUnitsByUnitTypeId);
        const spacesMap: Record<string, SpaceModel> = spaces.reduce(
          (ac, cur) => {
            ac[`${cur.third_party_space_id}_${cur.size}`] = cur;
            return ac;
          },
          {},
        );

        logger.log(
          `Grouped types with UnitTypeId: ${unitTypes.length} for 3rd party site: ${site.third_party_site_id}`,
        );

        for (const type of unitTypes) {
          logger.log(
            `Grouping areas with UnitTypeId: ${type} for 3rd party site: ${site.third_party_site_id}`,
          );
          const groupedSpacesByType = groupedUnitsByUnitTypeId[type];
          const groupedSpacesByArea = groupBy(
            groupedSpacesByType,
            (unit) => unit.Area,
          );
          const areasInType = Object.keys(groupedSpacesByArea);

          logger.log(
            `Grouped area types: ${areasInType.length} with UnitTypeId: ${type} for 3rd party site: ${site.third_party_site_id}`,
          );

          const spacesToBeDeleted = spaces
            .filter(
              (sp) =>
                sp.third_party_space_id === type &&
                !areasInType.includes(String(sp.size)),
            )
            .map((sp) => sp.id);

          try {
            logger.warn(`Archiving ${spacesToBeDeleted.length} spaces...`);
            await spaceService.archive(spacesToBeDeleted);
          } catch (e) {
            logger.error('Error occurred while archiving spaces', e.stack);
          }

          for (const area of areasInType) {
            const spacesByArea = groupedSpacesByArea[area];
            logger.log(
              `Spaces ${spacesByArea.length} with area types: ${area} with UnitTypeId: ${type} for 3rd party site: ${site.third_party_site_id}`,
            );

            // Space exists, update it
            try {
              if (!spacesByArea) {
                return;
              }

              // Sitelink returns results which have multiple rows for same unit type id
              // We group their stock
              const stock = spacesByArea.reduce(
                (o, curr) => {
                  o.total += curr.TotalUnits;
                  o.vacant += curr.TotalVacant;
                  o.reserved += curr.TotalReserved;
                  // Lowest price between all units for this id
                  o.price = Math.min(
                    o.price,
                    Math.min(curr.PushRate, curr.StandardRate),
                  );
                  return o;
                },
                { total: 0, vacant: 0, reserved: 0, price: Infinity },
              );

              const space = spacesMap[`${type}_${area}`];
              const unitObj = spacesByArea[0];

              if (!space) {
                // Space doesn't exist in our DB, we need to create it
                await spaceService.create(
                  {
                    name: unitObj.TypeName || '',
                    features_id: getSpaceFeatures(unitObj),
                    height: 0,
                    width: unitObj.Width,
                    length:
                      unitObj.Length || unitObj.Width
                        ? calcLengthFromArea(unitObj.Area, unitObj.Width)
                        : 0,
                    status: SpaceStatus.ACTIVE,
                    size: parseFloat(unitObj.Area.toFixed(2)),
                    size_unit: siteLinkStore.unit_type,
                    total_units: stock.total,
                    available_units: Math.max(stock.vacant - stock.reserved, 0),
                    platform_space_type_id: getSpaceTypeId(unitObj.Area),
                    stock_management_type: StockManagementType.THIRD_PARTY,
                    third_party_space_id: type,
                    price_per_month: parseFloat(
                      (
                        stock.price +
                        (stock.price * 1) / commissionPercent
                      ).toFixed(2),
                    ),
                    site_id: site.id,
                  },
                  {
                    user_id: site.user_id,
                    currency: siteLinkStore.currency,
                    currency_sign: siteLinkStore.currency_sign,
                  },
                );

                logger.log(
                  `Created space with stock: available=${stock.vacant} total=${stock.total}`,
                );
                continue;
              }

              logger.log('Trying to update stock for space');

              space.total_units = stock.total;
              space.length =
                unitObj.Length || unitObj.Width
                  ? calcLengthFromArea(unitObj.Area, unitObj.Width)
                  : 0;
              space.name = unitObj.TypeName;
              space.width = unitObj.Width;
              space.height = 0;
              space.status = SpaceStatus.ACTIVE;
              space.stock_management_type = StockManagementType.THIRD_PARTY;
              space.platform_space_type_id = getSpaceTypeId(unitObj.Area);
              space.available_units = Math.max(
                stock.vacant - stock.reserved,
                0,
              );

              await Promise.all([
                space.save(),
                spaceFeatureService.upsert(space.id, getSpaceFeatures(unitObj)),
                priceService.update(
                  space.id,
                  parseFloat(
                    (
                      stock.price +
                      (stock.price * 1) / commissionPercent
                    ).toFixed(2),
                  ),
                ),
              ]);

              logger.log(
                `Updated stock available=${stock.vacant} total=${stock.total} for space ${space.id}`,
              );
            } catch (e) {
              logger.error('Error occurred while processing space..', e.stack);
            }
          }
        }
      } catch (e) {
        logger.error(e.message);
        logger.error(
          `Error occurred while syncing site with id ${site.id}`,
          e.stack,
        );
      }
    }

    // update ES
    await Promise.all(
      allSites.map((site) =>
        rabbitMQService.pushToQueue(esKey, { site_id: site.id }),
      ),
    );
    // adios
    await app.close();
  } catch (e) {
    logger.error(e.message, e.stack);
  }
};

const syncSiteLinkStores = async () => {
  const stores: ISiteLinkByStore[] = [
    {
      store_name: SiteLinkStore.STOREHUB,
      country: FixedCountry.Singapore,
      unit_type: SpaceSizeUnit.sqft,
      currency: 'SGD',
      currency_sign: 'S$',
    },
    {
      store_name: SiteLinkStore.JWD_STORE_IT,
      country: FixedCountry.Thailand,
      unit_type: SpaceSizeUnit.sqm,
      currency: 'THB',
      currency_sign: '฿',
    },
  ];

  for (const store of stores) {
    await siteLinkSyncCron(store);
  }

  // eslint-disable-next-line no-restricted-syntax
  console.log('Cron job completed');

  process.exit(0);
};

void syncSiteLinkStores();
