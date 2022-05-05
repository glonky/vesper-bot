import { chain } from 'lodash';

// export type AttributeType = 'string' | 'number' | 'list' | 'boolean' | 'map' | 'binary' | 'set';

// export interface Attribute {
//   type?: AttributeType;
//   default?: () => any;
//   required?: boolean;
//   delimiter?: string;
//   prefix?: string;
//   suffix?: string;
//   partitionKey?: boolean | 'string';
//   sortKey?: boolean | 'string';
// }
export interface Attributes {
  pk: string;
  sk?: string;

  [key: string]: string | number | boolean | null | undefined;
}

export interface BaseEntityProps {
  name: string;
  idPrefix?: string;
  attributes: Attributes;
}

export class BaseEntity {
  private readonly idPrefix?: string;

  private readonly name: string;

  public readonly attributes: Attributes;

  constructor(props: BaseEntityProps) {
    this.name = props.name;
    this.idPrefix = props?.idPrefix;
    // this.partitionKey = props.partitionKey;
    // this.sortKey = props?.sortKey;
    this.attributes = props.attributes;
  }

  public static create(attributes: Attributes) {
    return {
      ...attributes,
      // ...this.getSecondaryIndexes(),
      // pk: this.getPartitionKey(),
      // sk: this.getSortKey(),
    };
  }

  public getPartitionKey() {
    const name = this.getEntityName();

    if (this.idPrefix) {
      return `${name}#${this.idPrefix}_${this.attributes.pk}`;
    }

    return `${name}#${this.attributes.pk}`;
  }

  public getSortKey() {
    // return this.sortKey;
  }

  public getSecondaryIndexes() {
    return {};
  }

  public getEntityName() {
    return chain(this.name).snakeCase().upperCase().value();
  }
}
