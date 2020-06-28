var dappIdentityId = 'DX66EJdogM6c2yG6ULTZYCzoqqRBm64XHuU42YbSK9tu';
var messageContractId = '6ow8zziDutSZP778QE88gWkyB2T9H7rdQaKXwUF2Fman';
var dappAddress = 'yM8bRVwE3bQmqrnvG1oSpyXky2gjGErR5a'

$(document).ready(function () {

    let username = sessionStorage.getItem('dash_username');
    if (username != null) {
        $("#signinbutton").removeClass('btn-success').addClass('btn-info');
        $("#signinbutton").val(username)
    }

    $("#exampleFormControlUser").val(dappAddress)

    $("#submitBtn").click(function () {
        console.log("click")
        $("#submitBtn").prop('disabled', true);

        var clientOpts = {};
        clientOpts.network = 'testnet';
        clientOpts.wallet = {};
        clientOpts.wallet.mnemonic = 'velvet timber under input escape rich gauge final submit burst glow garage';
        var curApps = '{ "messageContract" : { "contractId" : "' + messageContractId + '" } }';
        curApps = JSON.parse(curApps);
        clientOpts.apps = curApps;

        const client = new Dash.Client(clientOpts);

        const submitTransactionDocument = async function () {

            try {
                const identity = await client.platform.identities.get(dappIdentityId);  // dapp identity

                //// dapp signing original
                // var docProperties = {
                //   nonce: 'eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzMsNzksMjM0LDcyLDc4LDE3MywxMzgsMjA2LDM3LDIzMiwyNyw4MCwxNDksNTMsMTkzLDIxNiwyNDEsMjE0LDI0OSwxMDEsMTI2LDM1LDQ1LDQzLDE2NCw5NCw5NywyLDI0NSwyNTIsMTMyLDUyLDExNSwxMDcsMTMsMTgxLDM2LDMxLDksMjIyLDI1MiwxMjEsMTQyLDE1NSwyNDYsMTk4LDQxLDE0MywyMDgsMjQwLDEsMTAsMTA1LDI1LDksMTQ4LDE1MiwyMTQsMjM1LDI0NywxOTMsMjA2LDY1LDEwNCw1MSwyNSwyMTksNDAsMTA2LDg3LDMxLDEyMSwxMjgsMTY1LDMwLDczLDU3LDEyMCw3NSwxNzksMTkxLDE0MCwxMDcsMTI4LDE1NSwxNjksMSwyMzksMTE0LDI0NiwxODEsMjI3LDIxOSwxMzksMTA0LDE3Myw5OCwyNSwyMTAsMTE0LDUwLDg2LDcwLDE1Niw4MiwxNywxMjMsMTU3LDYzLDE4MSwyMCwxMzcsMTg5LDE3Miw3OCwyMTEsMTI5LDExMCw5NiwyNDksNzgsMjM0LDIzLDI0MCwzNiwyNDUsMTcyLDIzMSwxOTRdfQ==',
                //   reference: '3w9znscBUiz8YdPNAtnMEDpdjZcECvybdLEuVGXmBN4y',
                //   uid_pin: 'eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzMsMTkzLDE2MiwxOTMsMjEwLDIwOSwzOCwxMDAsODUsMjM1LDEyNSw4LDQ0LDg0LDU2LDQ2LDIxMywxNjYsOTUsMjAyLDIyNywzMiwxODYsMjA5LDE3NywxNTQsMTc2LDE1MCwxMzcsMTU4LDExOSwyOSw4OCwyMDksODQsMjE3LDM3LDEzLDE3OCwyNTMsMjIsNTIsMTM2LDEzNCw3MiwyMjYsMTIyLDIyOSwyMjcsMzcsMTkwLDEwMyw0OCwyMzksMTA5LDk2LDIyMCwzMCwxNjIsMjE0LDI0OCw1NCwxMDEsMTY3LDE0NiwyMTUsMTQ1LDExMCwxOTAsMywyMDAsMjQzLDI2LDY1LDE4MSwxMzMsMTQ3LDY0LDIxMSwxNjYsOTAsNTMsMjAsMjA1LDIyNSw3NSwyMCwzMSwyMDgsMTE2LDc5LDE5NCwxOTQsNTYsMjM3LDk5LDk5LDE2OSw4NywxNzIsMSwyMzcsMjE1LDcxLDIwNCwyMzEsNjgsNTIsMzAsNzAsMTcwLDYzLDU2LDUxLDI1NSwzLDE4LDY5LDI2LDM1LDU2LDQzLDE1NywzOSwxNTksODcsMjUyLDIxMCwxNTFdfQ==',
                //   temp_dappname: 'readme dapp browser sample',
                //   temp_timestamp: submitText.value + ' ' + new Date().toUTCString()
                // }

                //// dapp signing simple
                docProperties = {
                    header: 'Request Transaction TX',
                    dappname: 'Simple Browser Dapp',
                    // reference: '4gibhaxmaUrf1SpwBegZ9EaKSfFeZLyGruZMne1GatSx', // target user docID (here readme atm, TODO make dynamic)
                    reference: username,
                    status: '0',
                    timestamp: new Date().toUTCString(),
                    TXaddr : dappAddress,
                    TXamount: $("#exampleFormControlAmount").val(),
                }

                // Create the note document
                const noteDocument = await client.platform.documents.create(
                    'messageContract.message',
                    identity,
                    docProperties,
                );

                const documentBatch = {
                    create: [noteDocument],
                    replace: [],
                    delete: [],
                }

                // Sign and submit the document
                await client.platform.documents.broadcast(documentBatch, identity);
            } catch (e) {
                console.error('Something went wrong:', e);
            } finally {
                console.log("submited Transaction Request with amount and address: " + $("#exampleFormControlAmount").val() + " Dash to " + $("#exampleFormControlUser").val())
                client.disconnect();
            }
        };
        submitTransactionDocument();
        $("#submitBtn").prop('disabled', false);
        console.log("done")
        
    });
});