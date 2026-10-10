import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { routePaths } from "@core/config";

const Itr = lazy(() => import("./components/Itr/Itr"));
const ItrFiling = lazy(() => import("./components/ItrFiling/ItrFiling"));
const TdsRefund = lazy(() => import("./components/TdsRefund/TdsRefund"));
// Disabled: Previous Year ITR / Tax Notice Assistance are not offered right now.
// const PreviousYearItr = lazy(
//   () => import("./components/PreviousYearItr/PreviousYearItr"),
// );
const RevisedItr = lazy(() => import("./components/RevisedItr/RevisedItr"));
// const TaxNoticeAssistance = lazy(
//   () => import("./components/TaxNoticeAssistance/TaxNoticeAssistance"),
// );

export const itrRoutes: RouteObject[] = [
  { path: routePaths.itr.root, element: <Itr /> },
  { path: routePaths.itr.itrFiling, element: <ItrFiling /> },
  { path: routePaths.itr.tdsRefund, element: <TdsRefund /> },
  // { path: routePaths.itr.previousYearItr, element: <PreviousYearItr /> },
  { path: routePaths.itr.revisedItr, element: <RevisedItr /> },
  // {
  //   path: routePaths.itr.taxNoticeAssistance,
  //   element: <TaxNoticeAssistance />,
  // },
];
