import { type SchemaTypeDefinition } from "sanity";

import { categoryType } from "./categoryType";
import { collectionType } from "./collectionType";
import { customerType } from "./customerType";
import { orderType } from "./orderType";
import { productType } from "./productType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, collectionType, customerType, productType, orderType],
};
