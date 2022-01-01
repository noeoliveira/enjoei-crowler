export interface IProduct {
  id: string;
  url: string | undefined;
  urlImage: string | undefined;
  price: string | undefined;
  name: string | undefined;
  brand: string | undefined;
  created_at?: number;
  updated_at?: number;
}
