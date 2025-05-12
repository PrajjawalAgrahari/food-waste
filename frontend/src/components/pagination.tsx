// src/components/Pagination.tsx
import React from 'react';
import ReactPaginate from 'react-paginate';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface PaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (selectedItem: { selected: number }) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  pageCount, 
  currentPage, 
  onPageChange 
}) => {
  return (
    <ReactPaginate
      previousLabel={<FaArrowLeft />}
      nextLabel={<FaArrowRight />}
      breakLabel="..."
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
      onPageChange={onPageChange}
      containerClassName="flex justify-center items-center space-x-2 mt-8"
      pageClassName="inline-block py-2 px-4 rounded-md border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      previousClassName="inline-block py-2 px-3 rounded-md border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      nextClassName="inline-block py-2 px-3 rounded-md border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
      breakClassName="inline-block py-2 px-4 rounded-md"
      activeClassName="bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
      disabledClassName="text-gray-300 cursor-not-allowed hover:bg-transparent hover:text-gray-300"
      forcePage={currentPage}
    />
  );
};

export default Pagination;
