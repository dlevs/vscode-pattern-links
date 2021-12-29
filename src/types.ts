export interface Config {
  rules: {
    linkPattern: string;
    linkTarget: string;
    languages: string[];
  }[];
}
