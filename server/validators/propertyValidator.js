import { body } from "express-validator";

export const propertyValidate = [
  body("propertyName").notEmpty().withMessage("Property name is required"),

  body("meals.*.name").notEmpty().withMessage("Meal name is required"),
  body("meals.*.price").notEmpty().withMessage("Meal price is required"),

  body("taxesAndCancellations.type")
    .notEmpty()
    .withMessage("Tax type is required"),
  body("taxesAndCancellations.feeType")
    .notEmpty()
    .withMessage("Fee type is required"),

  body("rules.checkIn").notEmpty().withMessage("Check-in time is required"),
  body("rules.checkOut").notEmpty().withMessage("Check-out time is required"),

  body("childrenAge.min")
    .notEmpty()
    .withMessage("Minimum age for children is required"),
  body("childrenAge.max")
    .notEmpty()
    .withMessage("Maximum age for children is required"),

  body("careTaker.name").notEmpty().withMessage("Caretaker name is required"),
  body("host.name").notEmpty().withMessage("Host name is required"),
  body("additionalHost.email")
    .notEmpty()
    .withMessage("Additional host email is required"),
];
