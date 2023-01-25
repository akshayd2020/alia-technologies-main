// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// import { Button, Frame, SkeletonPage, Layout, Card, TextContainer, SkeletonDisplayText, SkeletonBodyText } from '@shopify/polaris'

// function App() {

//   return (
//     <Frame>
//       <SkeletonPage>
//         <Layout>
//           <Layout.Section>
//             <Card sectioned>
//               <TextContainer>
//                 <SkeletonDisplayText size="small" />
//                 <SkeletonBodyText lines={9} />
//               </TextContainer>
//             </Card>
//           </Layout.Section>
//         </Layout>
//       </SkeletonPage>
//     </Frame>
//   );
// }

// export default App;

import { AppProvider, Frame} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css"; // Important! Sets up the Polaris stylesheet
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { QuestionStatus } from "./components/lesson/Lesson";
import QuestionTab from "./components/lesson/QuestionTab";
import HomePage from "./pages/HomePage";
import LessonPage from "./pages/LessonPage";
import { DisplayRewards } from "./components/home/Reward";
const App = () => {

  return (
    <div style={{ width: "400px", height: "800px", border:"2px"}}>
      <AppProvider
        i18n={{}} // this has to do with translations, I think?
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element = {<HomePage />}/>
            <Route path="/lesson/:lessonID" element = {<LessonPage />}/>
            <Route path="/reward" element = {<DisplayRewards />}/>
          </Routes>
        </BrowserRouter>
        <Frame>
        </Frame>
      </AppProvider>
    </div>
  );
};

export default App;
