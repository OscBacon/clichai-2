export type Participant = Record<string, string>;

export interface Match {
  participant: Participant;
  match: Participant | null;
  explanation: string | null;
}
