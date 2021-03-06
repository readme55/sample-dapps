// todo, fetch identity from mnemonic when dashjs support
// static "message contract", can be exchanged with Push-Notification-service later
let client = null;
// let docID = '';
let identityId = '';
let clientOpts = {};


$(document).ready(function () {
    console.log("doc ready")

    let storageUsername = sessionStorage.getItem('dash_username');
    if (storageUsername != null) {
        $("#inputUsername").val(storageUsername)
    }

    $("#submitBtn").click(async function () {

        console.log("click")

        let inputUsername = $("#inputUsername").val();
        $("#submitBtn").prop('disabled', true);

        // Submit a document ("Request Document ST") to the Users Wallet
        clientOpts = {};
        clientOpts.network = dashNetwork;
        clientOpts.dapiAddresses = [
            '34.220.41.134',
            '18.236.216.191',
            '54.191.227.118',
        ];
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = dappMnemonic;
        clientOpts.wallet.adapter = new LocalForageWrapper();
        clientOpts.wallet.unsafeOptions = {};
        clientOpts.wallet.unsafeOptions.skipSynchronizationBeforeHeight = 415000; // only sync from start of 2021

        client = new Dash.Client(clientOpts);
        client.getApps().set("messageContract", { "contractId": messageContractId })


        // get identity ID for user
        console.log("fetch identity ID from username")

        async function getIdentityId() {

            // let recordLocator = "dpns.domain";
            // let queryString = '{ "where": [' +
            //     '["normalizedParentDomainName", "==", "dash"],' +
            //     '["normalizedLabel", "==", "' + inputUsername.toLowerCase() + '"]' +
            //     '],' +
            //     '"startAt": 1 }';

            try {

                const identityIdRecord = await client.platform.names.resolve(inputUsername.toLowerCase() + ".dash");
                identityId = identityIdRecord.data.records.dashUniqueIdentityId.toString()
                // let queryJson = JSON.parse(queryString);

                // const documents = await client.platform.documents.get(recordLocator, queryJson);
                // console.log(documents)
                // if (documents[0] == null || documents[0] == undefined) {
                //     console.log("Couldnt connect to network, aborting polling! Please try again in a few moments.");
                // } else {
                //     console.log("DocumentID for user " + inputUsername + ": " + documents[0].id)
                //     console.log("Identity for user " + inputUsername + ": " + documents[0].ownerId)
                //     docID = documents[0].id.toString()
                //     identityID = documents[0].ownerId.toString()
                //     console.log("saved Identity ID")
                // }
                console.log("DocumentID for user " + inputUsername + ": " + identityIdRecord.id.toString())
                console.log("Identity for user " + inputUsername + ": " + identityId)
                console.log("saved Identity ID")

            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                // client.disconnect()
            }
        }
        await getIdentityId();


        // submit auth request to wallet
        console.log("submit Authentication Request")
        const submitAuthRequest = async function () {

            try {
                let identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

                // create document
                docProperties = {
                    header: 'Request Document ST',
                    dappname: 'Simple Browser Dapp',
                    reference: inputUsername,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    STcontract: messageContractId,
                    STdocument: 'message',
                    STcontent: '{ "header" : "Response Login", "dappname" : "Simple Browser Dapp", "reference" : "' + inputUsername + '", "timestamp" : "' + new Date().toUTCString() + '", "STcontract" : "' + messageContractId + '", "STdocument" : "message" }',
                }

                // Create the note document
                const messageDocument = await client.platform.documents.create(
                    'messageContract.message',
                    identity,
                    docProperties,
                );

                const documentBatch = {
                    create: [messageDocument],
                    replace: [],
                    delete: [],
                }

                // Sign and submit the document
                console.log("submitting...")
                await client.platform.documents.broadcast(documentBatch, identity);
            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                console.log("submited Request Document ST for user: " + inputUsername)
                // client.disconnect();
            }
        };
        submitAuthRequest();


        console.log("start polling for Authentication Response")
        async function pollAuthResponse() {
            let recordLocator = "messageContract.message";

            try {
                let isHead = false;
                let nStart = 1;

                while (true) {

                    queryString = '{ "startAt" : "' + nStart + '" }';
                    queryJson = JSON.parse(queryString);
                    console.log("Poll document startAt: " + nStart)
                    let documents = await client.platform.documents.get(recordLocator, queryJson);

                    // find head document (can only poll 100 documents at once)
                    if (isHead == false) {
                        if (documents.length == 0) {
                            console.log("Found head at doc nr " + nStart)
                            isHead = true;
                            await new Promise(r => setTimeout(r, 1500));  // sleep x ms
                        }
                        nStart = nStart + documents.length;
                        continue;
                    }

                    if (documents.length >= 1 && documents[0].ownerId.toString() == identityId && documents[0].data.reference == inputUsername) {
                        console.log("Received valid Authentication Response")
                        return true;
                    }
                    await new Promise(r => setTimeout(r, 3000));  // sleep x ms
                    if (documents.length >= 1) nStart++;
                }
                // return false;

            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                // client.disconnect()
            }
        }
        let response = await pollAuthResponse();
        console.log("response: " + response)

        if (response) {
            sessionStorage.setItem('dash_username', $("#inputUsername").val());
            sessionStorage.setItem('dash_identityID', identityId);
            console.log("username set: " + $("#inputUsername").val())
            window.location.href = "./index.html";
        }

        $("#submitBtn").prop('disabled', false);
        console.log("done")

    });


});