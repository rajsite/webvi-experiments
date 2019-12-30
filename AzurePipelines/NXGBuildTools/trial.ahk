CoordMode, Mouse, Client

; Click the BEGIN 7 DAY TRIAL button or the first REMIND ME NEXT TIME Button
WinWait LabVIEW NXG 4.0
WinActivate LabVIEW NXG 4.0
WinWaitActive LabVIEW NXG 4.0
Click, 400, 340

; Click the second REMIND ME NEXT TIME button if it exists
Sleep 2000
IfWinExist, LabVIEW NXG 4.0
{
    WinActivate
    Click, 400, 340
    return
}
