export interface BaseEvent<T> {
  execute(props: T): Promise<void>;
  name: string;
}
