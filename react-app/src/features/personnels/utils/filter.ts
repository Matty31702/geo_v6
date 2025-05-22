import { Personnel } from "../api/models";

/**
 * Get fileted personnel
 * - filter byL name, email, and phone_number
 */
const getFilteredPersonnel = (searchTerm: string, personnels: Personnel[]) => {
  return (
    personnels?.filter((person) => {
      const matchesSearch =
        !searchTerm ||
        person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.phone_number?.includes(searchTerm);

      return matchesSearch;
    }) || []
  );
};

export {
  getFilteredPersonnel,
};
