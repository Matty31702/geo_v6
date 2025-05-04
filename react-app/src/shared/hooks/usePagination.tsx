import { useEffect, useState } from "react";

const usePagination = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle change search
  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
  };

  return {
    searchTerm,
    currentPage,
    handlePageChange,
    handleSearchChange,
  };
};

export default usePagination;
