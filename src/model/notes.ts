export type Note = {
  text: string;
  /** uuid, matches outer id */
  _id: string;
  /** epoch time created with new Date().getTime() */
  _created: string;
  /** epoch time updated with new Date().getTime() */
  _updated: string;
};

export type Notes = {
  [id: string]: Note;
};
