"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import styles from "../../styles/MultiSelectDropdown.module.css";
import Label from "./label";

interface MultiSelectDropdownProps {
  label?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select options...",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(value.filter((v) => v !== option));
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      {label && <Label className={styles.label}>{label}</Label>}

      <div
        className={styles.selector}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length > 0 ? (
          value.map((item) => (
            <span
              key={item}
              className={styles.tag}
              onClick={(e) => e.stopPropagation()}
            >
              {item}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(item);
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}

        <ChevronDown
          size={16}
          className={`${styles.chevron} ${
            isOpen ? styles.rotate : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className={styles.searchInput}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className={styles.options}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`${styles.option} ${
                    value.includes(option)
                      ? styles.optionSelected
                      : ""
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className={styles.noOptions}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;