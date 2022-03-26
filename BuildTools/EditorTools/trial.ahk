CoordMode, Mouse, Client

; Click the BEGIN 7 DAY TRIAL button or the first REMIND ME NEXT TIME Button
WinWait G Web Development Software 2022 Q1
WinActivate G Web Development Software 2022 Q1
WinWaitActive G Web Development Software 2022 Q1
Sleep 4000
WinWaitActive G Web Development Software 2022 Q1
Click, 400, 340

; Click the second REMIND ME NEXT TIME button if it exists
Sleep 4000
IfWinExist, G Web Development Software 2022 Q1
{
    WinActivate
    Click, 400, 340
    return
}
