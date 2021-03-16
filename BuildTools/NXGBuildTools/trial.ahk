CoordMode, Mouse, Client

; Click the BEGIN 7 DAY TRIAL button or the first REMIND ME NEXT TIME Button
WinWait LabVIEW NXG 5.1
WinActivate LabVIEW NXG 5.1
WinWaitActive LabVIEW NXG 5.1
Click, 400, 340

; Click the second REMIND ME NEXT TIME button if it exists
Sleep 2000
IfWinExist, LabVIEW NXG 5.1
{
    WinActivate
    Click, 400, 340
    return
}
