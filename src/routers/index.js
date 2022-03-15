import { useRoutes } from "react-router-dom"

import Navbar from "components/Navbar"
import Footer from "components/Footer"
import NotFound from "components/NotFound"

import MultiSender from "./Multisender"

import UseScrollToTop from "hooks/useScrollToTop"

import { AppRoutes } from "constants/UI"

const AppRouter = () => {
  let routes = useRoutes([
    { path: AppRoutes.MULTISENDER, element: <MultiSender /> },
    { path: AppRoutes.NOTFOUND, element: <NotFound /> },
  ])

  return (
    <>
      <Navbar />
      <UseScrollToTop>{routes}</UseScrollToTop>
      <Footer />
    </>
  )
}

export default AppRouter
