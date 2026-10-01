import React, { useEffect, useState } from "react";
import { usePermission } from "@/hooks/usePermission";
import Button from "../../extra/Button";
import Input from "../../extra/Input";
import Selector from "../../extra/Selector";
import { useSelector } from "react-redux";
import { getCountry, addFakeUser } from "../../store/userSlice";
import { closeDialog } from "../../store/dialogSlice";
import ReactSelect from "react-select";
import { RootStore, useAppDispatch } from "@/store/store";

import { uploadFile } from "@/store/adminSlice";
import { projectName } from "@/util/config";
import { IconChevronLeft } from "@tabler/icons-react";
import { permissionError } from "@/util/Alert";

interface ErrorState {
  fullName: string;
  nickName: string;
  mobileNumber: string;
  email: string;
  gender: string;
  country: string;
  age: string;
  bio: string;
  image: string;
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    height: "38px",
    minHeight: "38px",
    borderRadius: "5px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#495057",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#cbd5e1",
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
    padding: "8px 12px",
    "&:active": {
      backgroundColor: "#8a82fb",
    },
  }),
};

function NewFakeUser() {
  const AgeNumber = Array.from(
    { length: 100 - 18 + 1 },
    (_, index) => index + 18,
  );
  const { dialogueData } = useSelector((state: any) => state.dialogue);
  const { countryData } = useSelector((state: any) => state.user);

  const dispatch = useAppDispatch();
  const [gender, setGender] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [nickName, setNickName] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [countryDataSelect, setCountryDataSelect] = useState<any>({});
  const [image, setImage] = useState<any>();
  const [imagePath, setImagePath] = useState<string>(
    dialogueData ? dialogueData?.image : "",
  );
  const [age, setAge] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [error, setError] = useState<ErrorState>({
    fullName: "",
    nickName: "",
    mobileNumber: "",
    email: "",
    gender: "",
    country: "",
    age: "",
    bio: "",
    image: "",
  });

  useEffect(() => {
    dispatch(getCountry());
  }, []);

  useEffect(() => {
    if (countryData?.length > 0) {
      const defaultCountry = countryData.find(
        (country) => country?.name?.common === "India",
      );
      if (defaultCountry) {
        setCountryDataSelect(defaultCountry);
      }
    }
  }, [countryData]);

  let folderStructure: string = `${projectName}/admin/userImage`;

  const handleFileUpload = async (image: any) => {
    // // Get the uploaded file from the event
    const file = image[0];
    const formData = new FormData();

    formData.append("folderStructure", folderStructure);
    formData.append("keyName", file?.name);
    formData.append("content", file);

    // Create a payload for your dispatch
    const payloadformData: any = {
      data: formData,
    };

    if (formData) {
      const response: any = await dispatch(
        uploadFile(payloadformData),
      ).unwrap();

      if (response?.data?.status) {
        if (response.data.url) {
          setImage(response.data.url);
          setImagePath(response.data.url);

          return response.data.url;
        }
      }
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage([e.target.files[0]]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError({ ...error, image: "" });
    }
  };

  const CustomOption: React.FC<{
    innerProps: any;
    label: string;
    data: any;
  }> = ({ innerProps, label, data }) => (
    <div
      {...innerProps}
      className="country-optionList my-2"
      style={{ cursor: "pointer" }}
    >
      <img
        src={data?.flags?.png ? data?.flags?.png : "No Image"}
        alt={label}
        height={30}
        width={30}
      />
      <span className="ms-2">{data?.name?.common && data?.name?.common}</span>
    </div>
  );

  const handleSelectChange = (selected: any | null) => {
    setCountryDataSelect(selected);

    if (!selected) {
      return setError({
        ...error,
        country: `Country Is Required`,
      });
    } else {
      return setError({
        ...error,
        country: "",
      });
    }
  };

  const { can } = usePermission();
  const canCreate = can("User", "Create");



  const handleSubmit = async () => {

    if (
      !fullName ||
      !nickName ||
      !mobileNumber ||
      !email ||
      !age ||
      !gender ||
      !countryDataSelect ||
      !image
    ) {
      let error = {} as ErrorState;
      if (!fullName) error.fullName = "Name Is Required !";
      if (!nickName) error.nickName = "User name Is Required !";
      if (!mobileNumber) error.mobileNumber = "Mobile Number Is Required !";
      if (!email) {
        error.email = "Email Is Required !";
      }
      if (!gender) error.gender = "Gender Is Required !";
      if (!image) error.image = "Image Is Required !";
      if (!bio) error.bio = "Bio Is Required !";
      if (!age) error.age = "Age is required !";
      if (!countryDataSelect) error.country = "Country is required !";
      if (!age) error.age = "Age is required !";

      return setError({ ...error });
    } else {
      const url = await handleFileUpload(image);

      const paylaod: any = {
        name: fullName,
        userName: nickName,
        gender: gender,
        age: age,
        image: url,
        bio: bio,
        country: countryDataSelect?.name?.common,
        countryFlagImage: countryDataSelect?.flags?.png,
        email: email,
        mobileNumber: mobileNumber,
      };

      const payload: any = {
        data: paylaod,
      };

      dispatch(addFakeUser(payload));
      dispatch(closeDialog());
    }
  };

  return (
    <div className="user-table fakeuser-table mb-3">
      <div className="user-table-top">
        <div className="fakeuser-header">
          <h5 className="fakeuser-title">Create Fake User</h5>
          <Button
            btnName={"Back"}
            newClass={"back-btn"}
            btnIcon={<IconChevronLeft />}
            onClick={() => dispatch(closeDialog())}
          />
        </div>
      </div>
      <form>
        <div className="row d-flex  align-items-center">
          {/* <div className="col-12 col-sm-6 col-md-6 col-lg-6 d-flex justify-content-end">
                <Button
                  btnName={'Back'}
                  newClass={'back-btn'}
                  onClick={() => dispatch(closeDialog())}
                />
              </div> */}
          {/* <div
                className="col-12 d-flex justify-content-end align-items-center"
                style={{
                  paddingTop: '8px',
                  marginTop: '11px',
                  borderTop: '1px solid #c9c9c9',
                }}
              >
                <Button
                  newClass={'submit-btn'}
                  btnName={'Submit'}
                  type={'button'}
                  onClick={handleSubmit}
                />
              </div> */}
          <div className="row mt-3 px-5">
            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2">
              <Input
                label={"Name"}
                name={"name"}
                placeholder={"Enter Details..."}
                errorMessage={error.fullName && error.fullName}
                defaultValue={dialogueData && dialogueData.name}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      fullName: `Name Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      fullName: "",
                    });
                  }
                }}
              />
            </div>
            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2">
              <Input
                label={"User name"}
                name={"userName"}
                placeholder={"Enter Details..."}
                errorMessage={error.nickName && error.nickName}
                defaultValue={dialogueData && dialogueData.userName}
                onChange={(e) => {
                  setNickName(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      nickName: `User name Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      nickName: "",
                    });
                  }
                }}
              />
            </div>
            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2">
              <Input
                label={"E-mail Address"}
                name={"email"}
                errorMessage={error.email && error.email}
                defaultValue={dialogueData && dialogueData.email}
                placeholder={"Enter Details..."}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      email: `Email Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      email: "",
                    });
                  }
                }}
              />
            </div>

            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2">
              <Input
                label={"Mobile Number"}
                name={"mobileNumber"}
                type={"number"}
                placeholder={"Enter Details..."}
                errorMessage={error.mobileNumber && error.mobileNumber}
                defaultValue={dialogueData && dialogueData.mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      mobileNumber: `Mobile Number Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      mobileNumber: "",
                    });
                  }
                }}
              />
            </div>

            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2">
              <Selector
                label={"Gender"}
                selectValue={gender}
                placeholder={"Select Gender"}
                selectData={["Male", "Female"]}
                errorMessage={error.gender && error.gender}
                defaultValue={dialogueData && dialogueData.gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      gender: `Gender Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      gender: "",
                    });
                  }
                }}
              />
            </div>
            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2">
              <Selector
                label={"Age"}
                selectValue={age}
                placeholder={"Select Age"}
                errorMessage={error.age && error.age}
                defaultValue={dialogueData && dialogueData.age}
                selectData={AgeNumber}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      age: `Age Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      age: "",
                    });
                  }
                }}
              />
            </div>
            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2">
              <div className="custom-input selector-custom">
                <label className="label-selector-custom m-0">Country</label>
                <div className="form-group mt-2">
                  <ReactSelect
                    options={countryData || []}
                    value={countryDataSelect}
                    isClearable={false}
                    onChange={(selected) => handleSelectChange(selected)}
                    getOptionValue={(option) => option?.name?.common}
                    formatOptionLabel={(option) => (
                      <div className="optionShow-option">
                        <img
                          height={30}
                          width={30}
                          alt={option?.name?.common}
                          src={option?.flags?.png ? option?.flags?.png : ""}
                        />
                        <span className="ms-2">{option?.name?.common}</span>
                      </div>
                    )}
                    components={{
                      Option: CustomOption,
                    }}
                    styles={selectStyles}
                    maxMenuHeight={185}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2 ">
              <Input
                type={"file"}
                label={"Image"}
                accept={"image/png, image/jpeg"}
                errorMessage={error.image && error.image}
                onChange={handleImage}
              />
              <p className="fakeuser-note">(Note: Accept .png, .jpg)</p>
            </div>

            <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-2 fake-create-img">
              <img
                src={imagePath && imagePath}
                alt=""
                draggable={false}
                className={`fakeuser-preview-img ${(!imagePath || imagePath === "") && "d-none"}`}
                data-class={`showImage`}
              />
            </div>
            <div className="col-12 mt-3 text-about">
              <label className="label-form">Bio</label>
              <textarea
                cols={6}
                rows={6}
                className="fakeuser-textarea"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      bio: `Bio Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      bio: "",
                    });
                  }
                }}
              ></textarea>
              {error.bio && (
                <p className="errorMessage">{error.bio && error.bio}</p>
              )}
            </div>
            <div className="col-12 my-4 sm:my-1 d-flex">
              <Button
                newClass={"submit-btn"}
                btnName={"Submit"}
                type={"button"}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NewFakeUser;
