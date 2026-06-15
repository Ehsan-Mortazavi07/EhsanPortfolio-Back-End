import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Offering, OfferingSchema } from './schemas/offering.schema';
import { OfferingsService } from './offerings.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offering.name, schema: OfferingSchema }]),
  ],
  providers: [OfferingsService],
  exports: [OfferingsService],
})
export class OfferingsModule {}
