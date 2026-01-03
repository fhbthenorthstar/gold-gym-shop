import { type SchemaTypeDefinition } from "sanity";

import { categoryType } from "./categoryType";
import { collectionType } from "./collectionType";
import { customerType } from "./customerType";
import { galleryImageType } from "./galleryImageType";
import { homeOfferType } from "./homeOfferType";
import { orderType } from "./orderType";
import { productType } from "./productType";
import { testimonialType } from "./testimonialType";
import { trainerType } from "./trainerType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    collectionType,
    customerType,
    galleryImageType,
    homeOfferType,
    productType,
    orderType,
    testimonialType,
    trainerType,
  ],
};
