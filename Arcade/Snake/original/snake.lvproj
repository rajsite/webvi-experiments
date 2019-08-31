<?xml version='1.0' encoding='UTF-8'?>
<Project Type="Project" LVVersion="9008000">
	<Item Name="My Computer" Type="My Computer">
		<Property Name="IOScan.Faults" Type="Str"></Property>
		<Property Name="IOScan.NetVarPeriod" Type="UInt">100</Property>
		<Property Name="IOScan.Period" Type="UInt">10000</Property>
		<Property Name="IOScan.PowerupMode" Type="UInt">0</Property>
		<Property Name="IOScan.Priority" Type="UInt">9</Property>
		<Property Name="IOScan.ReportModeConflict" Type="Bool">false</Property>
		<Property Name="IOScan.StartEngineOnDeploy" Type="Bool">false</Property>
		<Property Name="server.app.propertiesEnabled" Type="Bool">true</Property>
		<Property Name="server.control.propertiesEnabled" Type="Bool">true</Property>
		<Property Name="server.tcp.enabled" Type="Bool">false</Property>
		<Property Name="server.tcp.port" Type="Int">0</Property>
		<Property Name="server.tcp.serviceName" Type="Str">My Computer/VI Server</Property>
		<Property Name="server.tcp.serviceName.default" Type="Str">My Computer/VI Server</Property>
		<Property Name="server.vi.callsEnabled" Type="Bool">true</Property>
		<Property Name="server.vi.propertiesEnabled" Type="Bool">true</Property>
		<Property Name="specify.custom.address" Type="Bool">false</Property>
		<Item Name="xyplot.ctl" Type="VI" URL="../xyplot.ctl"/>
		<Item Name="collision_wall.vi" Type="VI" URL="../collision_wall.vi"/>
		<Item Name="next_move.vi" Type="VI" URL="../next_move.vi"/>
		<Item Name="xyplot_delete.vi" Type="VI" URL="../xyplot_delete.vi"/>
		<Item Name="xyplot_insert.vi" Type="VI" URL="../xyplot_insert.vi"/>
		<Item Name="collision_self.vi" Type="VI" URL="../collision_self.vi"/>
		<Item Name="snake.vi" Type="VI" URL="../snake.vi"/>
		<Item Name="resolve_apples.vi" Type="VI" URL="../resolve_apples.vi"/>
		<Item Name="Dependencies" Type="Dependencies">
			<Item Name="vi.lib" Type="Folder">
				<Item Name="ex_BuildTextVarProps.ctl" Type="VI" URL="/&lt;vilib&gt;/express/express output/BuildTextBlock.llb/ex_BuildTextVarProps.ctl"/>
				<Item Name="ex_CorrectErrorChain.vi" Type="VI" URL="/&lt;vilib&gt;/express/express shared/ex_CorrectErrorChain.vi"/>
			</Item>
			<Item Name="ccw.vi" Type="VI" URL="../ccw.vi"/>
		</Item>
		<Item Name="Build Specifications" Type="Build">
			<Item Name="Snake" Type="EXE">
				<Property Name="App_applicationGUID" Type="Str">{3387F2E3-A204-4954-8846-B40260719285}</Property>
				<Property Name="App_applicationName" Type="Str">snake.exe</Property>
				<Property Name="App_companyName" Type="Str">National Instruments</Property>
				<Property Name="App_fileVersion.major" Type="Int">1</Property>
				<Property Name="App_INI_aliasGUID" Type="Str">{D23E113A-B8F3-4D4C-9A73-7CD8A1FFCD96}</Property>
				<Property Name="App_INI_GUID" Type="Str">{FB946841-F067-4E83-97B4-7EDCFB5F9BA4}</Property>
				<Property Name="App_internalName" Type="Str">Snake</Property>
				<Property Name="App_legalCopyright" Type="Str">Copyright © 2006 National Instruments</Property>
				<Property Name="App_productName" Type="Str">Snake</Property>
				<Property Name="Bld_buildSpecName" Type="Str">Snake</Property>
				<Property Name="Bld_excludeLibraryItems" Type="Bool">true</Property>
				<Property Name="Bld_excludePolymorphicVIs" Type="Bool">true</Property>
				<Property Name="Bld_excludeTypedefs" Type="Bool">true</Property>
				<Property Name="Bld_modifyLibraryFile" Type="Bool">true</Property>
				<Property Name="Destination[0].destName" Type="Str">snake.exe</Property>
				<Property Name="Destination[0].path" Type="Path">../NI_AB_PROJECTNAME/snake.exe</Property>
				<Property Name="Destination[0].type" Type="Str">App</Property>
				<Property Name="Destination[1].destName" Type="Str">Support Directory</Property>
				<Property Name="Destination[1].path" Type="Path">../NI_AB_PROJECTNAME/data</Property>
				<Property Name="Destination[2].destName" Type="Str">Destination Directory</Property>
				<Property Name="Destination[2].path" Type="Path">../NI_AB_PROJECTNAME</Property>
				<Property Name="DestinationCount" Type="Int">3</Property>
				<Property Name="Source[0].Container.applyDestination" Type="Bool">true</Property>
				<Property Name="Source[0].Container.applyInclusion" Type="Bool">true</Property>
				<Property Name="Source[0].Container.applyProperties" Type="Bool">true</Property>
				<Property Name="Source[0].itemID" Type="Str">{29CFEFD8-DF5B-4C27-B228-F947C880DAE8}</Property>
				<Property Name="Source[0].type" Type="Str">Container</Property>
				<Property Name="Source[1].destinationIndex" Type="Int">0</Property>
				<Property Name="Source[1].itemID" Type="Ref">/My Computer/snake.vi</Property>
				<Property Name="Source[1].sourceInclusion" Type="Str">TopLevel</Property>
				<Property Name="Source[1].type" Type="Str">VI</Property>
				<Property Name="SourceCount" Type="Int">2</Property>
			</Item>
		</Item>
	</Item>
</Project>
