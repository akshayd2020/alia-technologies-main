import React, { useState } from "react";
import './styles/LessonTooltip.scss';
import { useNavigate } from "react-router-dom";
import { NumberLiteralType } from "typescript";

export enum TooltipDirection {
    UP_LEFT = "up-left",
    UP_RIGHT = "up-right",
    DOWN_LEFT = "down-left",
    DOWN_RIGHT = "down-right"
}

export interface LessonTooltipProps {
    lessonNumber: number;
    lessonID: number;
    isCompleted: boolean;
    estimatedTime: number;
    questions: number;
    lessonPoints: number;
    tooltipDirection: TooltipDirection;
    children?: React.ReactNode;
  }
  
  const LessonTooltip = ({
    lessonNumber,
    lessonID,
    isCompleted,
    estimatedTime,
    questions,
    lessonPoints,
    tooltipDirection,
    children}: LessonTooltipProps) => {

        const [active, setActive] = useState(false);
        const navigate = useNavigate();

        const showTip = () => {
            setActive(!active);
        };

        // const hideTip = () => {
        //     setActive(false);
        // }; onMouseLeave={hideTip}

        const redirect = () => {
            navigate("/lesson/" + lessonID.toString());
        }
        return (
            <div className="tooltip-wrapper"> 
                <div onClick={showTip} className={`tooltip-children ${active ? 'active' : 'inactive'}`}>
                    {children}
                </div>
                {active && 
                    (<div className={`tooltip-container ${isCompleted ? 'completed' : 'resume'} ${tooltipDirection.toString()}`}>
                        <div className='tooltip-header'>
                            <div>
                                <h3>Lesson {lessonNumber}</h3>
                            </div>
                        </div>
                        <div className='tooltip-time'>
                                <h3>{estimatedTime} min</h3>
                        </div>
                        <div className="tooltip-info">
                            <h4>{questions} Questions</h4>
                            <h4>{lessonPoints} {isCompleted ? 'Points Earned' : 'Potential Points'}</h4>
                        </div>
                        <button onClick={redirect}>{isCompleted ? 'Review' : 'Resume'}</button>
                    </div>) }
            </div>
            
            );

    }
  
    export default LessonTooltip;