import { type SchemaTypeDefinition } from "sanity";

import { categoryType } from "./categoryType";
import { collectionType } from "./collectionType";
import { contactMessageType } from "./contactMessageType";
import { customerType } from "./customerType";
import { galleryImageType } from "./galleryImageType";
import { homeOfferType } from "./homeOfferType";
import { orderType } from "./orderType";
import { productType } from "./productType";
import { reviewType } from "./reviewType";
import { subscriptionPackageType } from "./subscriptionPackageType";
import { subscriptionType } from "./subscriptionType";
import { testimonialType } from "./testimonialType";
import { trainingType } from "./trainingType";
import { trainerType } from "./trainerType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    collectionType,
    contactMessageType,
    customerType,
    galleryImageType,
    homeOfferType,
    productType,
    reviewType,
    orderType,
    subscriptionPackageType,
    subscriptionType,
    testimonialType,
    trainingType,
    trainerType,
  ],
};
