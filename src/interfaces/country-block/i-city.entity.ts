export interface ICityEntity<T, I> {
  id: number;
  name: string;
  imageUlr: I;
  description: string;
  country: T;
}
