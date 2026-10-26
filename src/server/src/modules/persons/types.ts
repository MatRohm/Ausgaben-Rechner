export interface Person {
  /** @isInt */
  id: number;
  /** @minLength 1 */
  name: string;
}

export interface PersonInput {
  /** @minLength 1 */
  name: string;
}
