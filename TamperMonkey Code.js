// ==UserScript==
// @name         Keep Session Alive
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Keep FAA MedXPress session alive with user interaction prompt and additional page handling for search, pending exams, and import application buttons
// @author       Michael Brown, MD
// @match        https://amcs.faa.gov/AMCS/ImportApplication.aspx
// @match        https://amcs.faa.gov/AMCS/SearchApplicant.aspx
// @match        https://amcs.faa.gov/AMCS/PendingExams.aspx
// @icon         https://www.google.com/s2/favicons?sz=64&domain=faa.gov
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/mlbrownmd/flightsurgeon/main/tampermonkey.user.js
// ==/UserScript==

(function() {
    'use strict';
    const interval = 5 * 60 * 1000; // 5 minutes
    const searchInterval = 7 * 60 * 1000; // 7 minutes
    const importInterval = 8 * 60 * 1000; // 8 minutes
    const responseTimeout = 30 * 1000; // 30 seconds
//test2
    // Function to send a fetch request
    function sendKeepAliveRequest() {
        fetch(window.location.href).then(response => {
            if (!response.ok) {
                console.error('Keep-alive request failed');
            }
        }).catch(error => {
            console.error('Keep-alive request error:', error);
        });
    }

    // Function to simulate user interaction on a submit button
    function simulateUserInteraction() {
        const submitButton = document.querySelector('input[type="submit"], button[type="submit"]');
        if (submitButton) {
            const userConfirmed = confirm('Do you want to keep the session alive? Click "Yes" to keep the session alive, or "No" to cancel.');
            
            if (userConfirmed) {
                // If user clicks "Yes", submit immediately
                submitButton.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
                submitButton.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));
            } else {
                // If user clicks "No" or times out, simulate key press after timeout
                setTimeout(() => {
                    const userResponse = confirm('You did not respond. Do you want to keep the session alive? Click "Yes" to keep the session alive, or "No" to cancel.');
                    if (userResponse) {
                        submitButton.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
                        submitButton.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));
                    }
                }, responseTimeout);
            }
        } else {
            console.warn('No submit button found on the page.');
        }
    }

    // Function to submit the SearchApplicant form
    function submitSearchForm() {
        const searchForm = document.querySelector('form[action="./SearchApplicant.aspx"]');
        if (searchForm) {
            searchForm.submit();
        } else {
            console.warn('No search form found on the page.');
        }
    }

    // Function to press the Pending Exams button
    function pressPendingExamsButton() {
        const pendingExamsButton = document.querySelector('input[type="button"][value="Pending Exams"], button[type="button"][value="Pending Exams"]');
        if (pendingExamsButton) {
            pendingExamsButton.click();
        } else {
            console.warn('No pending exams button found on the page.');
        }
    }

    // Function to handle Import Application page inactivity
    function handleImportApplicationInactivity() {
        if (window.location.pathname.includes('ImportApplication.aspx')) {
            setTimeout(() => {
                const userResponse = confirm('You have been inactive for 8 minutes. Do you want to keep the session alive by pressing the "Pending Exams" button? Click "Yes" to proceed, or "No" to cancel.');
                if (userResponse) {
                    pressPendingExamsButton();
                }
            }, importInterval);
        }
    }

    // Set intervals to keep the session alive
    setInterval(() => {
        sendKeepAliveRequest();
        simulateUserInteraction();
    }, interval);

    // Set interval to submit SearchApplicant form
    setInterval(() => {
        submitSearchForm();
    }, searchInterval);

    // Set interval to press Pending Exams button
    setInterval(() => {
        pressPendingExamsButton();
    }, searchInterval + 2 * 60 * 1000); // 2 minutes after submitting the SearchApplicant form

    // Set timeout to handle inactivity on Import Application page
    handleImportApplicationInactivity();
})();
