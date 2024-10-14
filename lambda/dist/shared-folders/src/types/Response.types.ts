export type Submit = {
  [key: string]: string | number | undefined;
};

export type Response = {
  responseid: string;
  responsecontent: {
    [key: string]: string ;
  },
  responsesetid: string;
}