export type RuntimeReferenceEntry = {
  id: string;
  data: {
    title?: string;
    name?: string;
    [key: string]: unknown;
  };
};
