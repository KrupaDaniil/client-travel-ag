export interface ICityEntity<T, I> {
  id: number;
  name: string;
  description: string;
  cityImage: I;
  country: T;
}
