import { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from "react";
import Button from "./Button";
// import SearchIcon from "../assets/icons/search.svg";
import { useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import ReactSelect from "react-select";
import { IconSearch } from "@tabler/icons-react";

export default function Searching(props: any) {
  const [search, setSearch] = useState<string>("");

  const {
    data,
    setData,
    type,
    serverSearching,
    setSearchData,
    placeholder,
    button,
    newClass,
    actionShow,
    setActionPagination,
    paginationSubmitButton,
    submitDisabled,
    actionPagination,
    customSelectDataShow,
    customSelectData,
    label,
    actionPaginationDataCustom,
    toolTipTitle,
    isCountryFilter,
    countryFilter,
    setCountryFilter,
  } = props;

  const [countries, setCountries] = useState<any[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  useEffect(() => {
    if (isCountryFilter) {
      fetch("/countries.json")
        .then((res) => res.json())
        .then((data) => {
          setCountries(data);
        })
        .catch((err) => console.log(err));
    }
  }, [isCountryFilter]);

  const countryOptions = countrySearch
    ? countries.filter((c: any) =>
      c?.name?.common?.toLowerCase().includes(countrySearch.toLowerCase())
    )
    : countries.slice(0, 5);



  const handleSearch = (searchValue: string) => {
    const getLowerCaseSearch = searchValue?.toLowerCase();

    if (type === "client") {
      if (getLowerCaseSearch) {
        const filteredData = data.filter((item: any) => {
          return Object.keys(item).some((key) => {
            if (["_id", "updatedAt", "createdAt"].includes(key)) return false;
            const itemValue = item[key];
            if (typeof itemValue === "string") {
              return itemValue.toLowerCase().includes(getLowerCaseSearch);
            } else if (typeof itemValue === "number") {
              return itemValue.toString().includes(getLowerCaseSearch);
            } else if (typeof itemValue === "object" && itemValue !== null) {
              return Object.values(itemValue).some((nestedValue) =>
                typeof nestedValue === "string"
                  ? nestedValue.toLowerCase().includes(getLowerCaseSearch)
                  : false,
              );
            }
            return false;
          });
        });
        setData(filteredData);
      } else {
        setData(data); // reset when cleared
      }
    } else {
      // 🔑 Server-side searching
      if (serverSearching) {
        serverSearching(searchValue);
      } else if (setSearchData) {
        setSearchData(searchValue);
      }
    }
  };

  // 🔹 DEBOUNCE: triggers handleSearch 1500ms after user stops typing
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 1500);

    return () => clearTimeout(timer);
  }, [search]);

  const paginationActionData = actionPaginationDataCustom
    ? actionPaginationDataCustom
    : ["Block", "Unblock", "Delete"];

  return (
    <>
      <div className="row search-action justify-content-end">
        <div
          className={`${actionShow === false ? "col-12" : "col-12 col-lg-auto col-md-auto col-sm-12"} `}
        >
          {/* <div className="searching-box" style={{ float: "right" }}> */}
          <div className="searching-box" style={{ width: "350px", maxWidth: "100%" }}>
            <div
              className={`prime-input search-input-box m-0 ${newClass}`}
              style={{
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "end",
                position: "relative",
              }}
            >
              <IconSearch
                size={16}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                  pointerEvents: "none",
                }}
              />
              <input
                type="search"
                autoComplete="off"
                placeholder={placeholder}
                aria-describedby="button-addon4"
                className="form-input searchBarBorderr"
                style={{ borderRadius: "5px", paddingLeft: "35px", textAlign: "left" }}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value); // only update state
                }}
              />

              {button && (
                <Button
                  type="button"
                  btnIcon="/icons/search.svg"
                  newClass={`themeBtn text-center fs-6  searchBtn text-white `}
                  onClick={(e: any) => handleSearch(e)}
                />
              )}
            </div>
          </div>
        </div>
        {actionShow === false ? (
          ""
        ) : (
          <>
            <div className="col-12 col-lg-auto col-md-auto col-sm-12  pagination-select p-0">
              <div className="d-flex align-items-center justify-content-end w-100 pagination-box">
                <div className="d-flex gap-3 justify-content-end w-100 flex-wrap">
                  {isCountryFilter && (
                    <div className="select-box" style={{ width: "200px", minWidth: "200px", flexShrink: 0 }}>
                      <ReactSelect
                        options={countryOptions}
                        value={countries.find(c => c.name.common === countryFilter) || null}
                        isClearable={true}
                        onInputChange={(val) => setCountrySearch(val)}
                        onChange={(selected: any) => setCountryFilter(selected ? selected.name.common : "")}
                        getOptionValue={(option: any) => option?.name?.common}
                        placeholder="Country"
                        filterOption={null}
                        formatOptionLabel={(option: any) => (
                          <div className="optionShow-option"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              width: '100%',
                              marginTop: "7px"
                            }}>
                            {option?.flags?.png && (
                              <img
                                height={20}
                                width={20}
                                alt={option?.name?.common}
                                src={option?.flags?.png}
                              />
                            )}
                            <span className="ms-2">{option?.name?.common}</span>
                          </div>
                        )}
                        // menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                        styles={{
                          placeholder: (base) => ({
                            ...base,
                            textAlign: "left",
                            width: "100%",
                            margin: 0,
                            left: "8px",
                            right: 0,
                          }),

                          singleValue: (base) => ({
                            ...base,
                            textAlign: "left",
                            width: "100%",
                            margin: 0,
                            left: "8px",
                            right: 0,
                          }),

                          input: (base) => ({
                            ...base,
                            textAlign: "left",
                            margin: 0,
                            padding: 0,
                          }),

                          valueContainer: (base) => ({
                            ...base,
                            padding: "0 8px",
                          }),

                          control: (base) => ({
                            ...base,
                            minHeight: "38px",
                            height: "38px",
                            width: "100%",
                            boxShadow: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                          }),

                          indicatorsContainer: (base) => ({
                            ...base,
                            height: "38px",
                          }),

                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),

                          // menuPortal: (base) => ({
                          //   ...base,
                          //   zIndex: 9999,
                          // }),

                          container: (base) => ({
                            ...base,
                            width: "100%",
                          }),
                        }}
                      />
                    </div>
                  )}
                  <div className="select-box" style={{ width: "180px", maxWidth: "100%", minWidth: "180px", flexShrink: 0 }}>
                    <select
                      name=""
                      id=""
                      className="form-select"
                      style={{ width: "100%", maxWidth: "100%" }}
                      value={actionPagination}
                      onChange={(e) => setActionPagination(e.target.value)}
                    >
                      {customSelectDataShow
                        ? customSelectData?.map((item: any) => {
                          return (
                            <option value={item?.toLowerCase()} key={item}>
                              {item}
                            </option>
                          );
                        })
                        : paginationActionData?.map((item: any) => {
                          return (
                            <option value={item?.toLowerCase()} key={item}>
                              {item}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  <div className="new-fake-btn" style={{ flexShrink: 0 }}>
                    <Button
                      onClick={paginationSubmitButton}
                      btnName={props.buttonLabel ?? "Block"}
                      disabled={submitDisabled}
                      style={{
                        opacity: submitDisabled ? 0.5 : 1,
                        cursor: submitDisabled ? "not-allowed" : "pointer",
                        pointerEvents: submitDisabled ? "none" : "auto",
                      }}
                      toolTipTitle={props.toolTipTitle}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
