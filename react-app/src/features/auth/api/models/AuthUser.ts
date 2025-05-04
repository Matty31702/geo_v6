export class CustomUser {
  private readonly id: string;
  private first_name: string;
  private middle_name: string;
  private last_name: string;
  private email: string;
  private readonly type: string;

  constructor({
    id,
    first_name,
    middle_name,
    last_name,
    email,
    type
  }: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    type: string; // ✅ fixed typo here
  }) {
    this.id = id;
    this.first_name = first_name;
    this.middle_name = middle_name;
    this.last_name = last_name;
    this.email = email;
    this.type = type;
  }

  getId(): string {
    return this.id;
  };

  getType(): string {
    return this.type;
  }

  // Optional: add getters
  getFullName(): string {
    return `${this.first_name} ${this.middle_name} ${this.last_name}`;
  }

  getEmail(): string {
    return this.email;
  }
}
