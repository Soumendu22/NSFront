"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { FieldValidation } from '@/utils/validation';

interface Option {
  value: string;
  label: string;
  company_name?: string;
  username?: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  validation?: FieldValidation;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  validation,
  required = false,
  disabled = false,
  className = "",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasError = validation && !validation.isValid;
  const hasSuccess = validation && validation.isValid && value;

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      (option.company_name && option.company_name.toLowerCase().includes(searchLower)) ||
      (option.username && option.username.toLowerCase().includes(searchLower))
    );
  });

  // Get selected option
  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {/* Select Container */}
      <div className="relative" ref={dropdownRef}>
        <div
          className={`
            relative w-full px-4 py-3 rounded-lg border text-sm cursor-pointer
            transition-all duration-200 ease-in-out
            ${hasError ? 'border-red-400 focus:border-red-300 focus:ring-red-500/20 shadow-lg shadow-red-500/10' : ''}
            ${hasSuccess ? 'border-green-400 focus:border-green-300 focus:ring-green-500/20 shadow-lg shadow-green-500/10' : ''}
            ${!validation ? 'border-white/30 focus:border-purple-400 focus:ring-purple-500/20 hover:border-white/50' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/50'}
            bg-white/10 backdrop-blur-md text-white
            focus-within:outline-none focus-within:ring-2
            ${className}
          `}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
        >
          {/* Selected Value or Placeholder */}
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            
            <div className="flex items-center gap-2">
              {/* Clear Button */}
              {selectedOption && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}
              
              {/* Dropdown Arrow */}
              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </div>

          {/* Validation Icon */}
          {validation && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              {hasError ? (
                <X className="w-4 h-4 text-red-400" />
              ) : hasSuccess ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : null}
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl max-h-64 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={`
                      px-4 py-3 cursor-pointer transition-colors duration-150
                      ${index === highlightedIndex ? 'bg-purple-500/20' : 'hover:bg-white/10'}
                      ${option.value === value ? 'bg-purple-500/30 text-purple-300' : 'text-white'}
                    `}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {option.value === value && (
                        <Check className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-400">
                  {emptyMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && validation?.message && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{validation.message}</p>
        </div>
      )}
    </div>
  );
};
