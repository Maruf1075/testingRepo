import React, { useState } from "react";
import { useEffect } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import Navbar from "./../../Componant/Navbar/Navbar";
import Footer from "./../../Componant/Footer/Footer";
import { Button } from "@material-ui/core";
import NotAvailable from "../NotAvailable/NotAvailable";
import LoadingCard from "../../Componant/LoadingCard/LoadingCard";
import {
  getData,
  postData,
  SharuEncryption,
} from "../../Functions/autoFunctions";
import { useContext } from "react";
import { UserContext } from "../../App";
import toast from "react-hot-toast";

const Login = () => {
  const { user } = useParams();
  const [loginuser, setLoginuser] = useContext(UserContext);

  const [userIsStudent, setUserIsStudent] = useState(false);
  const [userIsEmployee, setUserIsEmployee] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [hiddenPass, setHiddenPass] = useState(true);
  const [loadpage, setLoadpage] = useState(false);

  let history = useHistory();
  let location = useLocation();

  let { from } = location.state || { from: { pathname: "/profile" } };
  useEffect(() => {
    setUserIsStudent(user === "student" ? true : false);
    setUserIsEmployee(user === "employee" ? true : false);
    setUserIsAdmin(user === "admin" ? true : false);
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    if (loginuser !== null) {
      history.push({
        pathname: "/profile",
        state: { from: location },
      });
    }
  }, []);
  // ask for profile from database
  const getProfile = (data) => {
    postData(`http://localhost:5500/getprofile/${data.id}`, data)
      .then((res) => res.json())
      .then((data) => {
        setLoginuser(data);
        localStorage.setItem("user", JSON.stringify(data));
        // console.log(data);
        history.push(from);
      });
  };

  const onSubmit = (data) => {
    data.password = SharuEncryption(data.password);
    setLoadpage(true);
    postData(`http://localhost:5500/authentication`, data)
      .then((r) => {
        if (r.status === 401) {
          toast.error("Wrong Password");
        } else if (r.status === 403) {
          toast.error("Invalid ID or Email");
        } else if (r.status === 200) {
          toast.success("Welcome to Abdur Rab Hall Website");
          document.getElementById("login-form").reset();
        } else {
          toast.error("Something went wrong");
        }
        setLoadpage(false);
        return r.json();
      })
      .then((res) => {
        data.authentication = res;
        getProfile(data);
        setLoadpage(false);

        // console.log(data);
      })
      .catch((err) => {
        // console.log(err);
        setLoadpage(false);
      });
  };
  const userLoginError = {
    reqError: `${
      (userIsStudent && "Student Id") ||
      (userIsEmployee && "Phone No.") ||
      (userIsAdmin && "Email")
    } required`,
    maxLenError: `${
      (userIsStudent && "Student Id") || (userIsEmployee && "Phone No.")
    } digit exceeded`,
    minLenError: `${
      (userIsStudent && "Student Id") || (userIsEmployee && "Phone No.")
    } must have ${(userIsStudent && "8") || (userIsEmployee && "11")} Digit`,
    onlyNumber: `Wrong ${
      (userIsStudent && "Id") || (userIsEmployee && "Phone No.")
    } Entered`,
    passReqError: `Password Required`,
    passMinLenError: `Password atleast have 6 digit`,
    emailValidity: `Email is not valid`,
  };
  return (
    <div>
      <Navbar></Navbar>
      {loadpage && <LoadingCard></LoadingCard>}

      <div className="container">
        <div className="row">
          <div className="loginPage w-100 ">
            {userIsStudent || userIsEmployee || userIsAdmin ? (
              <>
                <div className="loginBox col-md-5 ">
                  <h4 className="card-title text-info text-center">{`${
                    (userIsStudent && "Student") ||
                    (userIsEmployee && "Employee") ||
                    (userIsAdmin && "Admin")
                  } Login`}</h4>
                  <hr />
                  <form onSubmit={handleSubmit(onSubmit)} id="login-form">
                    <div className="form-group  my-4">
                      <input
                        type="text"
                        className="form-control form-control-lgd p-3"
                        placeholder={`${
                          (userIsStudent && "Enter Student Id") ||
                          (userIsEmployee && "Enter Employee Phone No") ||
                          (userIsAdmin && "Enter Admin Email")
                        }`}
                        {...register("id", {
                          required: userLoginError.reqError,
                          maxLength: {
                            value:
                              (userIsStudent && 12121) ||
                              (userIsEmployee && 99999) ||
                              (userIsAdmin && 9999999),
                            message: userLoginError.maxLenError,
                          },
                          minLength: {
                            value:
                              (userIsStudent && 0) ||
                              (userIsEmployee && 0) ||
                              (userIsAdmin && 0),
                            message: userLoginError.minLenError,
                          },
                          pattern: {
                            value: userIsAdmin
                              ? /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/
                              : /^(0|[0-9]*)$/,
                            message: userIsAdmin
                              ? userLoginError.emailValidity
                              : userLoginError.onlyNumber,
                          },
                        })}
                        autoComplete="on"
                      />
                      {errors.id && (
                        <span className="text-danger">
                          *{errors.id?.message}
                        </span>
                      )}
                    </div>

                    <div className="form-group passfield my-4">
                      <input
                        type={hiddenPass ? "password" : "text"}
                        className="form-control "
                        placeholder="Enter Password"
                        {...register("password", {
                          required: userLoginError.passReqError,
                          minLength: {
                            value: 6,
                            message: userLoginError.passMinLenError,
                          },
                        })}
                        autoComplete="on"
                        data-aria="password"
                      />
                      <span
                        className="showHidePass"
                        onClick={() => setHiddenPass(!hiddenPass)}
                      >
                        {hiddenPass ? "Show" : "Hide"}
                      </span>
                      {errors.pass && (
                        <span className="text-danger">
                          *{errors.pass?.message}
                        </span>
                      )}
                    </div>

                    <Button
                      className="btn-block"
                      type="submit"
                      color="primary"
                      variant="contained"
                    >
                      Login
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <NotAvailable
                message={"Wrong Path. Please Select the right path"}
                errorCode={404}
              ></NotAvailable>
            )}
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Login;
