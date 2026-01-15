// domain/value-objects/UserMetadata.ts

export class UserMetadata {
  private constructor(
    public readonly notes?: string,
    public readonly tags?: string[],
    public readonly priority?: 'low' | 'medium' | 'high',
    public readonly customStatus?: string
  ) {}

  static create(data?: {
    notes?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    customStatus?: string;
  }): UserMetadata {
    return new UserMetadata(data?.notes, data?.tags, data?.priority, data?.customStatus);
  }

  updateNotes(notes: string): UserMetadata {
    return new UserMetadata(notes, this.tags, this.priority, this.customStatus);
  }

  updateTags(tags: string[]): UserMetadata {
    return new UserMetadata(this.notes, tags, this.priority, this.customStatus);
  }

  updatePriority(priority: 'low' | 'medium' | 'high'): UserMetadata {
    return new UserMetadata(this.notes, this.tags, priority, this.customStatus);
  }

  updateCustomStatus(customStatus: string): UserMetadata {
    return new UserMetadata(this.notes, this.tags, this.priority, customStatus);
  }

  hasNotes(): boolean {
    return !!this.notes && this.notes.trim().length > 0;
  }

  hasTags(): boolean {
    return !!this.tags && this.tags.length > 0;
  }
}
