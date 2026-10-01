import React from "react";
import ReactSelect from "react-select";

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    height: "38px",
    minHeight: "38px",
    borderRadius: "5px",
    border: state.isFocused ? "1px solid #ababab" : "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#495057",
    boxShadow: "none",
    backgroundColor: state.isFocused ? "#fefdff" : "#fff",
    "&:hover": {
      borderColor: state.isFocused ? "#ababab" : "#cbd5e1",
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    height: "38px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
  }),
  input: (base: any) => ({
    ...base,
    margin: "0px",
    padding: "0px",
  }),
  placeholder: (base: any) => ({
    ...base,
    color: "#858585",
  }),
  singleValue: (base: any) => ({
    ...base,
    color: "#495057",
    textTransform: "capitalize" as const,
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    height: "36px",
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#8a82fb"
      : state.isFocused
      ? "#e8e7fd"
      : "transparent",
    color: state.isSelected ? "white" : "#495057",
    cursor: "pointer",
    fontSize: "14px",
    textTransform: "capitalize" as const,
    padding: "8px 12px",
    "&:active": {
      backgroundColor: "#8a82fb",
    },
  }),
};

export default function Selector(props: any) {
  const {
    label,
    placeholder,
    selectValue,
    paginationOption,
    id,
    labelShow,
    selectData,
    onChange,
    type,
    isdisabled,
    defaultValue,
    errorMessage,
    selectId,
    data,
  } = props;

  const options = selectData?.map((item: any) => {
    const labelVal = selectId
      ? (item as { _id: string; name: string; fullName?: string }).fullName ||
        (item as { _id: string; name: string; fullName?: string }).name
      : typeof item === "string"
      ? item.toLowerCase()
      : item;

    const valueVal = selectId
      ? (item as { _id: string })._id
      : typeof item === "string"
      ? item.toLowerCase()
      : item;

    return {
      value: valueVal,
      label: labelVal,
    };
  }) || [];

  const currentValue = options.find((opt: any) => opt.value?.toString() === selectValue?.toString()) || null;

  const handleReactSelectChange = (selectedOption: any) => {
    if (onChange) {
      onChange({
        target: {
          name: label,
          value: selectedOption ? selectedOption.value : "",
        },
      });
    }
  };

  return (
    <div className="selector-custom">
      {labelShow === false ? (
        " "
      ) : (
        <label htmlFor={id} className="label-selector-custom m-0">
          {label}
        </label>
      )}

      <div style={{ minWidth: 120 }} className="form-group mt-2">
        <ReactSelect
          id={id || "formControlLg"}
          placeholder={placeholder}
          options={options}
          value={currentValue}
          onChange={handleReactSelectChange}
          isDisabled={data?.isFake === false || isdisabled}
          styles={selectStyles}
          maxMenuHeight={185}
        />
      </div>
      {errorMessage && (
        <p className="errorMessage">{errorMessage}</p>
      )}
    </div>
  );
}
