WinWait LabVIEW NXG Licensing Wizard
Sleep 10000
ControlClick, Evaluate
Sleep 2000
WinWait, ahk_exe labviewnxgcli.exe, Extend Evaluation?
ControlClick, No

; WinWait LabVIEW NXG Licensing Wizard
; Sleep 10000
; ControlClick, x220 y460, LabVIEW NXG Licensing Wizard
; Sleep 2000
; ControlClick, x270 y400, LabVIEW NXG Licensing Wizard
;evaluate nxg3   WindowsForms10.Window.b.app.0.28bc8c8_r6_ad15
;evaluate button WindowsForms10.Window.b.app.0.fd727f_r12_ad15
;not buttonnxg3  WindowsForms10.Window.b.app.0.28bc8c8_r6_ad11
;no button       WindowsForms10.Window.b.app.0.fd727f_r12_ad11
