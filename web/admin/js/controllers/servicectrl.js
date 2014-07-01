/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2014 DreamFactory Software, Inc. <support@dreamfactory.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ServiceCtrl = function(dfLoadingScreen, $scope, Service, SystemConfigDataService ) {

    // Used to let us know when the Services are loaded
    $scope.servicesLoaded = false;

    // Added controls for responsive
    $scope.xsWidth = $(window).width() <= 992 ? true : false;
    $scope.activeView = 'list';

    $scope.setActiveView = function (viewStr) {

        $scope.activeView = viewStr;
    };

    $scope.close = function () {

        $scope.setActiveView('list');
    };

    $scope.open = function () {

        $scope.setActiveView('form');
    };

    $scope.$watch('xsWidth', function (newValue, oldValue) {

        if (newValue == false) {
            $scope.close();
        }
    });

    $(window).resize(function(){
        if(!$scope.$$phase) {
            $scope.$apply(function () {
                if ($(window).width() <= 992) {
                    $scope.xsWidth = true;
                }else {
                    $scope.xsWidth = false;
                }
            })
        }
    });

    // End Controls for responsive



	$scope.$on(
		'$routeChangeSuccess', function() {
			$( window ).resize();
		}
	);
	Scope = $scope;
    Scope.sql_placeholder="mysql:host=my_server;dbname=my_database";
    var systemConfig = SystemConfigDataService.getSystemConfig();
    if(systemConfig.server_os.indexOf("win") !== -1 && systemConfig.server_os.indexOf("darwin") === -1){
        Scope.sql_placeholder="mysql:Server=my_server;Database=my_database";
        Scope.microsoft_sql_server_prefix = "sqlsrv:"
    }else{
        Scope.microsoft_sql_server_prefix = "dblib:"
    }
    $scope.sqlVendors = [
        {
            name:"MySQL",
            prefix:"mysql:"
        },
        {
            name:"Microsoft SQL Server",
            prefix:Scope.microsoft_sql_server_prefix
        } ,
        {
            name:"PostgreSQL",
            prefix:"pgsql:"
        }];
    Scope.promptForNew = function() {

        // Added for small devices
        $scope.open();

        Scope.currentServiceId = '';
		Scope.action = "Create";
		$( '#step1' ).show();
		Scope.service = {};
        $scope.$watch(
            "sqlServerPrefix",
            function( newValue, oldValue ) {

                if ( newValue === oldValue ) {

                    return;

                }
                if(newValue === "sqlsrv:"){
                 Scope.sql_server_host_identifier = "Server";
                 Scope.sql_server_db_identifier = "Database";
                }else{
                Scope.sql_server_host_identifier = "host";
                Scope.sql_server_db_identifier = "dbname";

                }
                $scope.service.dsn = newValue;
                if($scope.sqlServerHost){
                    $scope.service.dsn = $scope.service.dsn + $scope.sql_server_host_identifier + "=" + $scope.sqlServerHost;
                }
                if($scope.sqlServerDb){
                    $scope.service.dsn = $scope.service.dsn + ";" + $scope.sql_server_db_identifier + "=" + $scope.sqlServerDb;
                }

            });
        $scope.$watch(
            "sqlServerHost",
            function( newValue, oldValue ) {
                if ( newValue === oldValue ) {

                    return;

                }
                $scope.service.dsn = $scope.sqlServerPrefix + $scope.sql_server_host_identifier + "=" + newValue;
                if($scope.sqlServerDb){
                    $scope.service.dsn = $scope.service.dsn + ";" + $scope.sql_server_db_identifier + "=" + $scope.sqlServerDb;
                }


            });
        $scope.$watch(
            "sqlServerDb",
            function( newValue, oldValue ) {
                if ( newValue === oldValue ) {

                    return;

                }
                $scope.service.dsn = $scope.sqlServerPrefix + $scope.sql_server_host_identifier + "=" + $scope.sqlServerHost + ";" + $scope.sql_server_db_identifier + "=" + newValue;


            });
        Scope.tableData = [];
		Scope.headerData = [];
		$( "#swagger, #swagger iframe" ).hide();
		$( '.save_button' ).show();
		$( '.update_button' ).hide();
		$( "tr.info" ).removeClass( 'info' );
		Scope.service.type = "Remote Web Service";
		Scope.showFields();
		$( '#file-manager' ).hide();
		$( "#button_holder" ).show();
		Scope.aws = {};
		Scope.azure = {};
		Scope.rackspace = {};
		Scope.openstack = {};
		Scope.mongodb = {};
		Scope.mongohq = {};
		Scope.couch = {};
		Scope.salesforce = {};
		Scope.script = {};
        Scope.service.is_active = true;
		$( window ).scrollTop( 0 );
		Scope.email_type = "Server Default";
	};

	var inputTemplate = '<input class="ngCellText" ng-class="col.colIndex()" ng-model="row.entity[col.field]" ng-change="enableSave()" />';
	var emailInputTemplate = '<input class="ngCellText" ng-class="col.colIndex()" ng-model="row.entity[col.field]" ng-change="updateEmailScope()" />';
	//var customHeaderTemplate = '<div class="ngHeaderCell">&nbsp;</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
	var buttonTemplate = '<div><button id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-click="deleteRow()"><li class="icon-remove"></li></button></div>';
	var headerInputTemplate = '<input class="ngCellText" ng-class="col.colIndex()" ng-model="row.entity[col.field]" ng-change="enableHeaderSave()" />';
	//var customHeaderTemplate = '<div class="ngHeaderCell">&nbsp;</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
	var headerButtonTemplate = '<div><button id="header_save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveHeaderRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-click="deleteHeaderRow()"><li class="icon-remove"></li></button></div>';
	var emailButtonTemplate = '<div><button id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveRow()"><li class="icon-save"></li></button></div>';
	Scope.columnDefs = [
		{field: 'name', width: 100, enableCellEdit: false},
		{field: 'value', width: 200, enableCellSelection: true, editableCellTemplate: inputTemplate, enableCellEdit: true },
		{field: 'Update', cellTemplate: buttonTemplate, width: 80, enableCellEdit: false}
	];

	Scope.browseOptions =
	{data: 'tableData', width: 500, columnDefs: 'columnDefs', enableCellEditOnFocus: true, enableRowSelection: false, canSelectRows: false, displaySelectionCheckbox: false};
	Scope.headerColumnDefs = [
		{field: 'name', width: 100, enableCellEdit: false},
		{field: 'value', width: 200, enableCellSelection: true, editableCellTemplate: headerInputTemplate, enableCellEdit: true},
		{field: 'Update', cellTemplate: headerButtonTemplate, width: 80, enableCellEdit: false}
	];
	Scope.headerOptions =
	{data: 'headerData', width: 500, columnDefs: 'headerColumnDefs', canSelectRows: false, enableCellEditOnFocus: true, enableRowSelection: false, displaySelectionCheckbox: false};

	Scope.service = {};
	Scope.Services = Service.get({},function(response) {
        $scope.servicesLoaded = true;

        // Stop loading screen
        dfLoadingScreen.stop();

        });
	Scope.action = "Create";
	Scope.emailOptions = [
		{name: "Server Default"},
		{name: "Server Command"},
		{name: "SMTP"}
	];
	Scope.email_type = "Server Default";
	Scope.remoteOptions = [
		{name: "Amazon S3", value: "aws s3"},
		{name: "Windows Azure Storage", value: "azure blob"},
		{name: "RackSpace CloudFiles", value: "rackspace cloudfiles"},
		{name: "OpenStack Object Storage", value: "openstack object storage"}
	];
	Scope.rackspaceRegions = [
		{name: "London", value: "LON"},
		{name: "Chicago", value: "ORD"},
		{name: "Dallas / Fort Worth", value: "DFW"}
	];
	Scope.awsRegions = [
		{name: "US EAST (N Virgina)", value: "us-east-1"},
		{name: "US WEST (N California)", value: "us-west-1"},
		{name: "US WEST (Oregon)", value: "us-west-2"},
		{name: "EU WEST (Ireland)", value: "eu-west-1"},
		{name: "Asia Pacific (Singapore)", value: "ap-southeast-1"},
		{name: "Asia Pacific (Sydney)", value: "ap-southeast-2"},
		{name: "Asia Pacific (Tokyo)", value: "ap-northeast-1"},
		{name: "South America (Sao Paulo)", value: "sa-east-1"}
	];
	Scope.NoSQLOptions = [
		{name: "Amazon DynamoDB", value: "aws dynamodb"},
		{name: "Amazon SimpleDB", value: "aws simpledb"},
		{name: "Windows Azure Tables", value: "azure tables"},
		{name: "CouchDB", value: "couchdb"},
		{name: "MongoDB", value: "mongodb"},
		{name: "MongoHQ", value: "mongohq"}

	];
	Scope.service.storage_type = "aws s3";
	Scope.serviceOptions = [
		{name: "Script Service"},
		{name: "Remote Web Service"},
		{name: "Local SQL DB"},
		{name: "Remote SQL DB"},
		{name: "Local SQL DB Schema"},
		{name: "Remote SQL DB Schema"},
		{name: "NoSQL DB"},
		{name: "Salesforce"},
		{name: "Local File Storage"},
		{name: "Remote File Storage"},
		{name: "Email Service"}
	];
	Scope.serviceCreateOptions = [
		{name: "Script Service"},
		{name: "Remote Web Service"},
		{name: "Remote SQL DB"},
		{name: "Remote SQL DB Schema"},
		{name: "NoSQL DB"},
		{name: "Salesforce"},
		{name: "Local File Storage"},
		{name: "Remote File Storage"},
		{name: "Email Service"}
	];
	Scope.securityOptions = [
		{name: "SSL", value: "SSL"},
		{name: "TLS", value: "TLS"}
	];
	$( '.update_button' ).hide();

	Scope.save = function() {
		if ( Scope.service.type == "Remote SQL DB" || Scope.service.type == "Remote SQL DB Schema" ) {
			Scope.service.credentials = {dsn: Scope.service.dsn, user: Scope.service.user, pwd: Scope.service.pwd};
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );
		}
		if ( Scope.service.type == "Email Service" ) {
			if ( Scope.email_type == "SMTP" ) {
				Scope.service.storage_type = "smtp";
				Scope.service.credentials =
				{host: Scope.service.host, port: Scope.service.port, security: Scope.service.security, user: Scope.service.user, pwd: Scope.service.pwd};
				Scope.service.credentials = JSON.stringify( Scope.service.credentials );
			}
		}
		if ( Scope.service.type == "Remote File Storage" ) {
			switch ( Scope.service.storage_type ) {
				case "aws s3":
					Scope.service.credentials = {access_key: Scope.aws.access_key, secret_key: Scope.aws.secret_key, bucket_name: Scope.aws.bucket_name};
					break;
				case "azure blob":
					Scope.service.credentials = {account_name: Scope.azure.account_name, account_key: Scope.azure.account_key};
					break;
				case "rackspace cloudfiles":
					Scope.service.credentials =
					{url: Scope.rackspace.url, api_key: Scope.rackspace.api_key, username: Scope.rackspace.username, tenant_name: Scope.rackspace.tenant_name, region: Scope.rackspace.region};
					break;
				case "openstack object storage":
					Scope.service.credentials =
					{url: Scope.openstack.url, api_key: Scope.openstack.api_key, username: Scope.openstack.username, tenant_name: Scope.openstack.tenant_name, region: Scope.openstack.region};
					break;
			}
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );
		}
		if ( Scope.service.type == "Salesforce" ) {
			Scope.service.credentials =
			{username: Scope.salesforce.username, password: Scope.salesforce.password, security_token: Scope.salesforce.security_token, version: Scope.salesforce.version};
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );
		}
		if ( Scope.service.type == "NoSQL DB" ) {

			switch ( Scope.service.storage_type ) {
				case "aws dynamodb":
					Scope.service.credentials =
					{access_key: Scope.aws.access_key, secret_key: Scope.aws.secret_key, bucket_name: Scope.aws.bucket_name, region: Scope.aws.region};
					break;
				case "aws simpledb":
					Scope.service.credentials =
					{access_key: Scope.aws.access_key, secret_key: Scope.aws.secret_key, bucket_name: Scope.aws.bucket_name, region: Scope.aws.region};
					break;
				case "azure tables":
					Scope.service.credentials = {account_name: Scope.azure.account_name, account_key: Scope.azure.account_key, PartitionKey: Scope.azure.PartitionKey};
					break;
				case "couchdb":
					Scope.service.credentials = {dsn: Scope.couchdb.service.dsn, user: Scope.couchdb.service.user, pwd: Scope.couchdb.service.pwd};
					break;
				case "mongodb":
					Scope.service.credentials =
					{dsn: Scope.mongodb.service.dsn, user: Scope.mongodb.service.user, pwd: Scope.mongodb.service.pwd, db: Scope.mongodb.service.db};
					break;
				case "mongohq":
					Scope.service.credentials =
					{dsn: Scope.mongohq.service.dsn, user: Scope.mongohq.service.user, pwd: Scope.mongohq.service.pwd, db: Scope.mongohq.service.db};
					break;
			}
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );
		}
		Scope.service.parameters = Scope.tableData;
		Scope.service.headers = Scope.headerData;
		var id = Scope.service.id;
		Service.update(
			{id: id}, Scope.service, function( data ) {
				updateByAttr( Scope.Services.record, 'id', id, data );
				Scope.promptForNew();
				//window.top.Actions.showStatus("Updated Successfully");

                // Added for small devices
                $scope.close();

                $(function(){
                    new PNotify({
                        title: 'Services',
                        type:  'success',
                        text:  'Updated Successfully.'
                    });
                });

			}
		);

	};
	Scope.create = function() {
		Scope.service.parameters = Scope.tableData;
		Scope.service.headers = Scope.headerData;
		if ( Scope.service.type == "Salesforce" ) {
			Scope.service.credentials =
			{username: Scope.salesforce.username, password: Scope.salesforce.password, security_token: Scope.salesforce.security_token, version: Scope.salesforce.version};
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );
		}

		if ( Scope.service.type == "Email Service" ) {

			switch ( Scope.email_type ) {
				case "Server Default":
					Scope.service.storage_type = null;
					break;
				case "Server Command":
					//Scope.service.storage_type = null;
					break;
				case "SMTP":

					Scope.service.storage_type = "smtp";
					Scope.service.credentials =
					{host: Scope.service.host, port: Scope.service.port, security: Scope.service.security, user: Scope.service.user, pwd: Scope.service.pwd};
					Scope.service.credentials = JSON.stringify( Scope.service.credentials );
					break;
			}

		}

		if ( Scope.service.type == "Remote SQL DB" || Scope.service.type == "Remote SQL DB Schema" ) {

			Scope.service.credentials = {dsn: Scope.service.dsn, user: Scope.service.user, pwd: Scope.service.pwd};
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );

		}
		if ( Scope.service.type == "Remote File Storage" ) {
			switch ( Scope.service.storage_type ) {
				case "aws s3":
					Scope.service.credentials = {access_key: Scope.aws.access_key, secret_key: Scope.aws.secret_key, bucket_name: Scope.aws.bucket_name};
					break;
				case "azure blob":
					Scope.service.credentials = {account_name: Scope.azure.account_name, account_key: Scope.azure.account_key};
					break;
				case "rackspace cloudfiles":
					Scope.service.credentials =
					{url: Scope.rackspace.url, api_key: Scope.rackspace.api_key, username: Scope.rackspace.username, tenant_name: Scope.rackspace.tenant_name, region: Scope.rackspace.region};
					break;
				case "openstack object storage":
					Scope.service.credentials =
					{url: Scope.openstack.url, api_key: Scope.openstack.api_key, username: Scope.openstack.username, tenant_name: Scope.openstack.tenant_name, region: Scope.openstack.region};
					break;
			}
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );
		}
		if ( Scope.service.type == "NoSQL DB" ) {
			switch ( Scope.service.storage_type ) {
				case "aws dynamodb":
					Scope.service.credentials =
					{access_key: Scope.aws.access_key, secret_key: Scope.aws.secret_key, bucket_name: Scope.aws.bucket_name, region: Scope.aws.region};
					break;
				case "aws simpledb":
					Scope.service.credentials =
					{access_key: Scope.aws.access_key, secret_key: Scope.aws.secret_key, bucket_name: Scope.aws.bucket_name, region: Scope.aws.region};
					break;
				case "azure tables":
					Scope.service.credentials = {account_name: Scope.azure.account_name, account_key: Scope.azure.account_key, PartitionKey: Scope.azure.PartitionKey};
					break;

				case "couchdb":
					Scope.service.credentials = {user: Scope.couchdb.service.username, pwd: Scope.couchdb.service.username, dsn: Scope.couchdb.service.dsn};
					break;
				case "mongodb":
					Scope.service.credentials =
					{user: Scope.mongodb.service.user, pwd: Scope.mongodb.service.pwd, dsn: Scope.mongodb.service.dsn, db: Scope.mongodb.service.db};
					break;
				case "mongohq":
					Scope.service.credentials =
					{user: Scope.mongohq.service.user, pwd: Scope.mongohq.service.pwd, dsn: Scope.mongohq.service.dsn, db: Scope.mongohq.service.db};
					break;
			}
			Scope.service.credentials = JSON.stringify( Scope.service.credentials );
		}

		Service.save(
			Scope.service, function( data ) {
				Scope.promptForNew();
				//window.top.Actions.showStatus("Created Successfully");

                // Added for small devices
                $scope.close();

                $(function(){
                    new PNotify({
                        title: 'Services',
                        type:  'success',
                        text:  'Created Successfully.'
                    });
                });
				Scope.Services.record.push( data );
			}
		);
	};

	Scope.showFields = function() {
		if ( Scope.service.type.indexOf( "Email" ) != -1 ) {
			if ( !Scope.service.id ) {
				Scope.tableData = [
					{"name": "from_name", "value": ""},
					{"name": "from_email", "value": ""},
					{"name": "reply_to_name", "value": ""},
					{"name": "reply_to_email", "value": ""}
				];
			}

			Scope.columnDefs = [
				{field: 'name', width: '*'},
				{field: 'value', enableFocusedCellEdit: true, width: '**', enableCellSelection: true, editableCellTemplate: emailInputTemplate }

			];
		}
		else {
			Scope.columnDefs = [
				{field: 'name', enableCellEdit: false, width: 100},
				{field: 'value', enableCellEdit: true, width: 200, enableCellSelection: true, editableCellTemplate: inputTemplate },
				{field: 'Update', cellTemplate: buttonTemplate, enableCellEdit: false, width: 100}
			];
			Scope.tableData = [];
		}

		switch ( Scope.service.type ) {
			case "Local SQL DB":
				$( '.base_url, .host, .command, .security, .port, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format,.user, .pwd, .dsn, .nosql_type' ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				// $(".user, .pwd, .dsn").show();
				break;
			case "Local SQL DB Schema":
				$( ".base_url,.host, .command, .security, .port, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format,.user, .pwd, .dsn,.nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				// $(".user, .pwd, .dsn").show();
				break;
			case "Remote SQL DB":
				$( ".base_url,.host, .command, .security, .port, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format,.nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				$( ".user, .pwd, .dsn" ).show();
				break;
			case "Remote SQL DB Schema":
				$( ".base_url,.host,.command, .security, .port, .parameters, .headers, .storage_name, .storage_type, .credentials, .native_format,.nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				$( ".user, .pwd, .dsn" ).show();
				break;
			case "Script Service":
			case "Remote Web Service":
				$( ".user, .pwd,.host, .command, .security, .port, .dsn ,.storage_name, .storage_type, .credentials, .native_format,.nosql_type" ).hide();

                // Hide message
                $( '#no-headers-message').hide();
                $( '#no-params-message').hide();

				$( ".base_url, .parameters, .headers" ).show();
				break;
			case "Local File Storage":
				$( ".user, .pwd,.host, .command, .security, .port,.base_url, .parameters, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format,.nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				$( ".storage_name" ).show();
				break;
			case "Remote File Storage":
				$( ".user, .host, .security,.command,  .port, .pwd,.base_url, .parameters, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format,.nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				$( ".storage_name, .storage_type" ).show();
				break;

			case "NoSQL DB":
				$( ".base_url, .command, .parameters , .user, .pwd,.host,.port, .security.parameters, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				$( ".nosql_type" ).show();
				break;
			case "Email Service":
				$( ".nosql_type , .base_url, .command, .parameters , .user, .pwd,.host,.port, .security.parameters, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				Scope.showEmailFields();
				break;
			case "Salesforce":
				$( ".nosql_type , .base_url, .command, .parameters , .user, .pwd,.host,.port, .security.parameters, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				break;
		}
	};

	Scope.showSwagger = function() {
		window.open(CurrentServer + "/swagger/#!/" + this.service.api_name, "swagger" )
	};

	Scope.showEmailFields = function() {

		switch ( Scope.email_type ) {
			case "Server Default":
				Scope.service.storage_type = null;
				$( ".user, .pwd,.host,.port,.command,  .security, .base_url, .parameters, .command, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format, .nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').show();
                $( '#no-params-message').show();

				//$(".user, .pwd,.host,.port,.command,  .security, .parameters").show();
				$( ".parameters" ).show();
				break;
			case "Server Command":
				Scope.service.storage_type = null;
				$( ".user, .pwd,.host,.port,.command,  .security,.base_url, .command, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format, .nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').show();

                // hide no params message
                $( '#no-params-message').hide();

				$( ".command, .parameters" ).show();
				break;
			case "SMTP":

				Scope.service.storage_type = "smtp";
				$( ".user, .pwd,.host,.port,.command,  .security,.base_url, .parameters, .command, .headers,.dsn ,.storage_name, .storage_type, .credentials, .native_format, .nosql_type" ).hide();

                // Show message
                $( '#no-headers-message').hide();

                // hide message
                $( '#no-params-message').hide();

				$( ".user, .pwd,.host,.port,  .security, .parameters" ).show();
				break;
		}
	};
	//noinspection ReservedWordAsName
	Scope.delete = function() {
		var which = this.service.name;
		if ( !which || which == '' ) {
			which = "the service?";
		}
		else {
			which = "the service '" + which + "'?";
		}
		if ( !confirm( "Are you sure you want to delete " + which ) ) {
			return;
		}
		var id = this.service.id;
		var api_name = this.service.api_name;

		Service.delete(
			{ id: id }, function() {
				Scope.promptForNew();
				//window.top.Actions.showStatus("Deleted Successfully");

                // Added for small devices
                $scope.close();

                $(function(){
                    new PNotify({
                        title: 'Services',
                        type:  'success',
                        text:  'Deleted Successfully.'
                    });
                });

				$( "#row_" + id ).fadeOut();
			}
		);
	};

	Scope.showDetails = function() {

        // Added for small devices
        $scope.open();

		$( '#step1' ).show();
		$( '#file-manager' ).hide();
		$( "#button_holder" ).show();

		Scope.$broadcast( 'swagger:off' );

		//$("#swagger, #swagger iframe, #swagctrl").hide();
		Scope.service = angular.copy( this.service );
        Scope.currentServiceId = Scope.service.id;
		if ( Scope.service.type.indexOf( "Email Service" ) != -1 ) {
			Scope.service.type = "Email Service";
			if ( Scope.service.storage_type == "smtp" ) {
				if ( Scope.service.credentials ) {
					var cString = Scope.service.credentials;
					Scope.service.host = cString.host;
					Scope.service.port = cString.port;
					Scope.service.security = cString.security;
					Scope.service.user = cString.user;
					Scope.service.pwd = cString.pwd;

				}
				Scope.email_type = "SMTP";
			}
			else if ( Scope.service.storage_type != null ) {
				Scope.email_type = "Server Command";
			}
			else {
				Scope.email_type = "Server Default";
			}

			Scope.showEmailFields();
		}
		if ( Scope.service.type == "Salesforce" ) {
			var cString = Scope.service.credentials;
			Scope.salesforce.username = cString.username;
			Scope.salesforce.password = cString.password;
			Scope.salesforce.security_token = cString.security_token;
			Scope.salesforce.version = cString.version;
		}
		if ( Scope.service.type == "Remote SQL DB" || Scope.service.type == "Remote SQL DB Schema" ) {
			if ( Scope.service.credentials ) {
				var cString = Scope.service.credentials;
				Scope.service.dsn = cString.dsn;
				Scope.service.user = cString.user;
				Scope.service.pwd = cString.pwd;
				Scope.service.region = cString.region;
			}
		}
		if ( Scope.service.type == "Remote File Storage" ) {
			Scope.aws = {};
			Scope.azure = {};
			if ( Scope.service.credentials ) {
				var fString = Scope.service.credentials;
				switch ( Scope.service.storage_type ) {
					case "aws s3":
						Scope.aws.access_key = fString.access_key;
						Scope.aws.secret_key = fString.secret_key;
						//Scope.aws.bucket_name = fString.bucket_name;
						break;
					case "azure blob":
						Scope.azure.account_name = fString.account_name;
						Scope.azure.account_key = fString.account_key;
						break;
					case "rackspace cloudfiles":
						Scope.rackspace.url = fString.url;
						Scope.rackspace.api_key = fString.api_key;
						Scope.rackspace.username = fString.username;
						Scope.rackspace.tenant_name = fString.tenant_name;
						Scope.rackspace.region = fString.region;

						break;
					case "openstack object storage":
						Scope.openstack.url = fString.url;
						Scope.openstack.api_key = fString.api_key;
						Scope.openstack.username = fString.username;
						Scope.openstack.tenant_name = fString.tenant_name;
						Scope.openstack.region = fString.region;
						break;
				}
			}
		}
		if ( Scope.service.type == "NoSQL DB" ) {
			Scope.aws = {};
			Scope.azure = {};
			Scope.couchdb = {service: {}};
			Scope.mongodb = {service: {}};
			Scope.mongohq = {service: {}};

			if ( Scope.service.credentials ) {
				var fString = Scope.service.credentials;
				switch ( Scope.service.storage_type ) {
					case "aws dynamodb":
						Scope.aws.access_key = fString.access_key;
						Scope.aws.secret_key = fString.secret_key;
						Scope.aws.region = fString.region;
						//Scope.aws.bucket_name = fString.bucket_name;
						break;
					case "aws simpledb":
						Scope.aws.access_key = fString.access_key;
						Scope.aws.secret_key = fString.secret_key;
						//Scope.aws.bucket_name = fString.bucket_name;
						Scope.aws.region = fString.region;
						break;
					case "azure tables":
						Scope.azure.account_name = fString.account_name;
						Scope.azure.account_key = fString.account_key;
                        Scope.azure.PartitionKey = fString.PartitionKey;
						break;
					case "couchdb":
						Scope.couchdb.service.dsn = fString.dsn;
						Scope.couchdb.service.user = fString.user;
						Scope.couchdb.service.pwd = fString.pwd;
						break;
					case "mongodb":
						Scope.mongodb.service.dsn = fString.dsn;
						Scope.mongodb.service.user = fString.user;
						Scope.mongodb.service.pwd = fString.pwd;
						Scope.mongodb.service.db = fString.db;
						break;
					case "mongohq":
						Scope.mongohq.service.dsn = fString.dsn;
						Scope.mongohq.service.user = fString.user;
						Scope.mongohq.service.pwd = fString.pwd;
						Scope.mongohq.service.db = fString.db;
						break;
				}
			}
		}
		Scope.action = "Update";
		$( '.save_button' ).hide();
		$( '.update_button' ).show();
		Scope.showFields();

		Scope.tableData = Scope.service.parameters;
		Scope.headerData = Scope.service.headers;
		$( "tr.info" ).removeClass( 'info' );
		$( '#row_' + Scope.service.id ).addClass( 'info' );
	};
	Scope.updateParams = function() {
		$( "#error-container" ).hide();
		if ( !Scope.param ) {
			return false;
		}
		if ( !Scope.param.name || !Scope.param.value ) {
			$( "#error-container" ).html( "Both name and value are required" ).show();
			return false;
		}
		if ( checkForDuplicate( Scope.tableData, 'name', Scope.param.name ) ) {
			$( "#error-container" ).html( "Parameter already exists" ).show();
			$( '#param-name, #param-value' ).val( '' );
			return false;
		}
		var newRecord = {};
		newRecord.name = Scope.param.name;
		newRecord.value = Scope.param.value;
		Scope.tableData.push( newRecord );
		Scope.param = null;
		$( '#param-name, #param-value' ).val( '' );
	};
	Scope.updateHeaders = function() {
		$( "#header-error-container" ).hide();
		if ( !Scope.header ) {
			return false;
		}
		if ( !Scope.header.name || !Scope.header.value ) {
			$( "#header-error-container" ).html( "Both name and value are required" ).show();
			return false;
		}
		if ( checkForDuplicate( Scope.headerData, 'name', Scope.header.name ) ) {
			$( "#header-error-container" ).html( "Header already exists" ).show();
			$( '#header-name, #header-value' ).val( '' );
			return false;
		}
		var newRecord = {};
		newRecord.name = Scope.header.name;
		newRecord.value = Scope.header.value;
		Scope.headerData.push( newRecord );
		Scope.header = null;
		$( '#header-name, #header-value' ).val( '' );
	};
	Scope.deleteRow = function() {
		var name = this.row.entity.name;
		Scope.tableData = removeByAttr( Scope.tableData, 'name', name );

	};
	Scope.deleteHeaderRow = function() {
		var name = this.row.entity.name;
		Scope.headerData = removeByAttr( Scope.headerData, 'name', name );

	};
	Scope.saveRow = function() {
		var index = this.row.rowIndex;
		var newRecord = this.row.entity;
		var name = this.row.entity.name;
		updateByAttr( Scope.tableData, "name", name, newRecord );
		$( "#save_" + index ).prop( 'disabled', true );
	};
	Scope.saveHeaderRow = function() {
		var index = this.row.rowIndex;
		var newRecord = this.row.entity;
		var name = this.row.entity.name;
		updateByAttr( Scope.headerData, "name", name, newRecord );
		$( "#header_save_" + index ).prop( 'disabled', true );
	};
	Scope.enableSave = function() {
		$( "#save_" + this.row.rowIndex ).prop( 'disabled', false );
	};
	Scope.enableHeaderSave = function() {
		$( "#header_save_" + this.row.rowIndex ).prop( 'disabled', false );
	};
	Scope.updateEmailScope = function() {
		//var index = this.row.rowIndex;
		var newRecord = this.row.entity;
		var name = this.row.entity.name;
		updateByAttr( Scope.tableData, "name", name, newRecord );
	};
	Scope.changeUrl = function() {
		switch ( this.rackspace.region ) {
			case "LON":
				Scope.rackspace.url = "https://lon.identity.api.rackspacecloud.com/";
				break;
			case "ORD":
				Scope.rackspace.url = "https://identity.api.rackspacecloud.com/";
				break;
			case "DFW":
				Scope.rackspace.url = "https://identity.api.rackspacecloud.com/";
				break;
		}
	};
	Scope.showFileManager = function() {
        window.open(CurrentServer + "/filemanager/?path=/" + this.service.api_name + "/&allowroot=false", "files-root");
	};
	$( "#param-value" ).keyup(
		function( event ) {
			if ( event.keyCode == 13 ) {

				$( "#param-update" ).click();
			}
		}
	);
	$( "#header-value" ).keyup(
		function( event ) {
			if ( event.keyCode == 13 ) {

				$( "#header-update" ).click();
			}
		}
	);
	angular.element( document ).ready(
		function() {
			Scope.promptForNew();
		}
	);
	//$( "#swagger, #swagger iframe" ).hide();
	Scope.promptForNew();

};