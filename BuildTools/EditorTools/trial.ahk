CoordMode, Mouse, Client

; Click the BEGIN 7 DAY TRIAL button or the first REMIND ME NEXT TIME Button
WinWait G Web Development Software 2021
WinActivate G Web Development Software 2021
WinWaitActive G Web Development Software 2021
Sleep 4000
WinWaitActive G Web Development Software 2021
Click, 400, 340

; Click the second REMIND ME NEXT TIME button if it exists
Sleep 4000
IfWinExist, G Web Development Software 2021
{
    WinActivate
    Click, 400, 340
    return
}
