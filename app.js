/* =========================================================
   CONFIGURATION
========================================================= */

const COTISATION = 300;
const TOTAL_PARTICIPANTS = 8;
const TOTAL_VERSEMENT = COTISATION * TOTAL_PARTICIPANTS;


/* =========================================================
   MOT DE PASSE ADMINISTRATEUR
========================================================= */

const ADMIN_PASSWORD = "Tontineouz@2026";


/* =========================================================
   PARTICIPANTS
========================================================= */

const DEFAULT_PARTICIPANTS = [

    {
        id: 1,
        name: "Abou Diallo"
    },

    {
        id: 2,
        name: "Micka Diallo"
    },

    {
        id: 3,
        name: "Mamadou Diallo"
    },

    {
        id: 4,
        name: "Ousmane Dabo"
    },

    {
        id: 5,
        name: "Ousmane Soumaré"
    },

    {
        id: 6,
        name: "IDI Diop"
    },

    {
        id: 7,
        name: "Samba Dioup"
    },

    {
        id: 8,
        name: "THIOUBA"
    }

];


/* =========================================================
   MOIS DE LA TONTINE
========================================================= */

const TONTEINE_MONTHS = [

    {
        key: "2026-09",
        label: "Septembre 2026"
    },

    {
        key: "2026-10",
        label: "Octobre 2026"
    },

    {
        key: "2026-11",
        label: "Novembre 2026"
    },

    {
        key: "2026-12",
        label: "Décembre 2026"
    },

    {
        key: "2027-01",
        label: "Janvier 2027"
    },

    {
        key: "2027-02",
        label: "Février 2027"
    },

    {
        key: "2027-03",
        label: "Mars 2027"
    },

    {
        key: "2027-04",
        label: "Avril 2027"
    },

    {
        key: "2027-05",
        label: "Mai 2027"
    }

];


/* =========================================================
   ÉTAT
========================================================= */

let participants = [];

let beneficiaryCurrent = 1;

let beneficiaryNext = null;

let beneficiarySchedule = {};

let currentMode = "participant";

let adminAuthenticated = false;


/* =========================================================
   CHARGEMENT
========================================================= */

function loadData() {

    const savedParticipants =
        localStorage.getItem(
            "tontineParticipants"
        );

    const savedSchedule =
        localStorage.getItem(
            "tontineBeneficiarySchedule"
        );

    const savedCurrent =
        localStorage.getItem(
            "tontineBeneficiaryCurrent"
        );

    const savedNext =
        localStorage.getItem(
            "tontineBeneficiaryNext"
        );


    /* =====================================================
       PARTICIPANTS
    ====================================================== */

    if (savedParticipants) {

        try {

            const saved =
                JSON.parse(
                    savedParticipants
                );

            participants =
                DEFAULT_PARTICIPANTS.map(
                    defaultParticipant => {

                        const oldParticipant =
                            saved.find(
                                participant =>
                                    Number(
                                        participant.id
                                    ) ===
                                    Number(
                                        defaultParticipant.id
                                    )
                            );

                        return {

                            id:
                                defaultParticipant.id,

                            name:
                                oldParticipant &&
                                oldParticipant.name
                                    ? oldParticipant.name
                                    : defaultParticipant.name,

                            paid:
                                oldParticipant
                                    ? Boolean(
                                        oldParticipant.paid
                                    )
                                    : true

                        };

                    }
                );

        }

        catch (error) {

            console.error(
                "Erreur de chargement des participants :",
                error
            );

            createDefaultParticipants();

        }

    }

    else {

        createDefaultParticipants();

    }


    /* =====================================================
       PLANNING DES BÉNÉFICIAIRES
    ====================================================== */

    beneficiarySchedule = {};

    if (savedSchedule) {

        try {

            beneficiarySchedule =
                JSON.parse(
                    savedSchedule
                ) || {};

        }

        catch (error) {

            console.error(
                "Erreur de chargement du planning :",
                error
            );

            beneficiarySchedule = {};

        }

    }


    /* =====================================================
       SEPTEMBRE 2026
    ====================================================== */

    beneficiaryCurrent = 1;

    beneficiarySchedule["2026-09"] =
        beneficiaryCurrent;


    /* =====================================================
       OCTOBRE 2026
    ====================================================== */

    if (
        Object.prototype.hasOwnProperty.call(
            beneficiarySchedule,
            "2026-10"
        )
    ) {

        beneficiaryNext =
            beneficiarySchedule["2026-10"];

    }

    else if (savedNext !== null) {

        try {

            beneficiaryNext =
                JSON.parse(
                    savedNext
                );

        }

        catch {

            beneficiaryNext = null;

        }

    }

    else {

        beneficiaryNext = null;

    }


    /* =====================================================
       INITIALISATION DES MOIS
    ====================================================== */

    TONTEINE_MONTHS.forEach(
        month => {

            if (
                !Object.prototype.hasOwnProperty.call(
                    beneficiarySchedule,
                    month.key
                )
            ) {

                beneficiarySchedule[month.key] =
                    null;

            }

        }
    );


    beneficiarySchedule["2026-10"] =
        beneficiaryNext;

}


/* =========================================================
   CRÉATION PARTICIPANTS
========================================================= */

function createDefaultParticipants() {

    participants =
        DEFAULT_PARTICIPANTS.map(
            participant => ({

                id:
                    participant.id,

                name:
                    participant.name,

                paid:
                    true

            })
        );

}


/* =========================================================
   SAUVEGARDE
========================================================= */

function saveData() {

    localStorage.setItem(
        "tontineParticipants",
        JSON.stringify(
            participants
        )
    );

    localStorage.setItem(
        "tontineBeneficiarySchedule",
        JSON.stringify(
            beneficiarySchedule
        )
    );

    localStorage.setItem(
        "tontineBeneficiaryCurrent",
        JSON.stringify(
            beneficiaryCurrent
        )
    );

    localStorage.setItem(
        "tontineBeneficiaryNext",
        JSON.stringify(
            beneficiaryNext
        )
    );

}


/* =========================================================
   EURO
========================================================= */

function formatEuro(amount) {

    return (
        Number(amount).toLocaleString(
            "fr-FR"
        ) + " €"
    );

}


/* =========================================================
   PARTICIPANT
========================================================= */

function getParticipant(id) {

    return participants.find(
        participant =>
            Number(participant.id) ===
            Number(id)
    );

}


/* =========================================================
   BÉNÉFICIAIRE D'UN MOIS
========================================================= */

function getBeneficiaryForMonth(monthKey) {

    const id =
        beneficiarySchedule[monthKey];

    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {

        return null;

    }

    return getParticipant(id);

}


/* =========================================================
   MODIFIER UN BÉNÉFICIAIRE
========================================================= */

function setBeneficiaryForMonth(
    monthKey,
    participantId
) {

    if (!adminAuthenticated) {

        return;

    }

    beneficiarySchedule[monthKey] =
        participantId
            ? Number(participantId)
            : null;


    if (monthKey === "2026-09") {

        beneficiaryCurrent =
            participantId
                ? Number(participantId)
                : null;

    }


    if (monthKey === "2026-10") {

        beneficiaryNext =
            participantId
                ? Number(participantId)
                : null;

    }


    saveData();

    refreshAllViews();

}


/* =========================================================
   CALCULS
========================================================= */

function getPaidParticipants() {

    return participants.filter(
        participant =>
            participant.paid === true
    );

}


function getUnpaidParticipants() {

    return participants.filter(
        participant =>
            participant.paid === false
    );

}


function getTotalCollected() {

    return (
        getPaidParticipants().length *
        COTISATION
    );

}


function getRemainingAmount() {

    return (
        getUnpaidParticipants().length *
        COTISATION
    );

}


/* =========================================================
   AUTHENTIFICATION ADMIN
========================================================= */

function requestAdminPassword() {

    if (adminAuthenticated) {

        return true;

    }


    const password =
        prompt(
            "Mot de passe administrateur :"
        );


    if (password === ADMIN_PASSWORD) {

        adminAuthenticated = true;

        return true;

    }


    alert(
        "Mot de passe incorrect."
    );

    return false;

}


/* =========================================================
   NAVIGATION ADMIN
========================================================= */

function setupAdminNavigation() {

    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();


                        if (
                            !adminAuthenticated
                        ) {

                            return;

                        }


                        const page =
                            this.dataset.page;


                        afficherPageAdmin(
                            page
                        );

                    }
                );

            }
        );

}


/* =========================================================
   AFFICHER PAGE ADMIN
========================================================= */

function afficherPageAdmin(page) {

    if (!adminAuthenticated) {

        return;

    }


    const pages = [

        "dashboardPage",

        "cotisationsPage",

        "versementsPage",

        "participantsPage",

        "historiquePage"

    ];


    pages.forEach(
        pageId => {

            const element =
                document.getElementById(
                    pageId
                );

            if (element) {

                element.style.display =
                    "none";

            }

        }
    );


    const target =
        document.getElementById(
            page + "Page"
        );


    if (target) {

        target.style.display =
            "block";

    }


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    const active =
        document.querySelector(
            `.menu-item[data-page="${page}"]`
        );


    if (active) {

        active.classList.add(
            "active"
        );

    }


    const titles = {

        dashboard:
            "Tableau de bord",

        cotisations:
            "Cotisations",

        versements:
            "Versements",

        participants:
            "Participants",

        historique:
            "Historique"

    };


    const title =
        document.getElementById(
            "pageTitle"
        );


    if (title) {

        title.textContent =
            titles[page] ||
            "Tableau de bord";

    }


    if (page === "dashboard") {

        updateDashboard();

    }


    if (page === "cotisations") {

        afficherCotisations();

    }


    if (page === "versements") {

        afficherVersements();

    }


    if (page === "participants") {

        afficherParticipants();

    }


    if (page === "historique") {

        afficherHistorique();

    }

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    if (!adminAuthenticated) {

        return;

    }


    const paid =
        getPaidParticipants();

    const unpaid =
        getUnpaidParticipants();

    const totalCollected =
        getTotalCollected();

    const remaining =
        getRemainingAmount();


    const totalElement =
        document.getElementById(
            "totalToCollect"
        );


    if (totalElement) {

        totalElement.textContent =
            formatEuro(
                TOTAL_VERSEMENT
            );

    }


    const collectedElement =
        document.getElementById(
            "totalCollected"
        );


    if (collectedElement) {

        collectedElement.textContent =
            formatEuro(
                totalCollected
            );

    }


    const remainingElement =
        document.getElementById(
            "remainingAmount"
        );


    if (remainingElement) {

        remainingElement.textContent =
            formatEuro(
                remaining
            );

    }


    const collectedStat =
        document.getElementById(
            "collectedStat"
        );


    if (collectedStat) {

        collectedStat.textContent =
            `${paid.length} / ${TOTAL_PARTICIPANTS} participants`;

    }


    const waitingStat =
        document.getElementById(
            "waitingStat"
        );


    if (waitingStat) {

        waitingStat.textContent =
            `${unpaid.length} participants`;

    }


    const nextPaymentAmount =
        document.getElementById(
            "nextPaymentAmount"
        );


    if (nextPaymentAmount) {

        nextPaymentAmount.textContent =
            formatEuro(
                TOTAL_VERSEMENT
            );

    }


    const percentage =
        TOTAL_VERSEMENT === 0
            ? 0
            : Math.round(
                (
                    totalCollected /
                    TOTAL_VERSEMENT
                ) * 100
            );


    const progressNumber =
        document.getElementById(
            "progressNumber"
        );


    if (progressNumber) {

        progressNumber.textContent =
            percentage + "%";

    }


    const progressValue =
        document.getElementById(
            "progressValue"
        );


    if (progressValue) {

        progressValue.style.width =
            percentage + "%";

    }


    const progressReceived =
        document.getElementById(
            "progressReceived"
        );


    if (progressReceived) {

        progressReceived.textContent =
            `${formatEuro(totalCollected)} reçus`;

    }


    const progressGoal =
        document.getElementById(
            "progressGoal"
        );


    if (progressGoal) {

        progressGoal.textContent =
            `${formatEuro(TOTAL_VERSEMENT)} objectif`;

    }


    afficherParticipantsPayes();

    afficherParticipantsNonPayes();

    afficherBeneficiaires();

}


/* =========================================================
   CARTE PARTICIPANT ADMIN
========================================================= */

function createParticipantAdminCard(
    participant
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "participant-card";


    card.innerHTML = `

        <div class="participant-icon">

            <i class="fa-solid fa-user"></i>

        </div>


        <div class="participant-info">

            <strong>
                ${escapeHtml(
                    participant.name
                )}
            </strong>

            <small>
                Participant ${participant.id}
            </small>

        </div>


        <label class="payment-control">

            <input
                type="checkbox"
                class="payment-checkbox"
                data-id="${participant.id}"
                ${
                    participant.paid
                        ? "checked"
                        : ""
                }
            >

            <span class="payment-label">

                ${
                    participant.paid
                        ? "Payé"
                        : "Non payé"
                }

            </span>

        </label>

    `;


    const checkbox =
        card.querySelector(
            ".payment-checkbox"
        );


    const label =
        card.querySelector(
            ".payment-label"
        );


    checkbox.addEventListener(
        "change",
        function() {

            if (!adminAuthenticated) {

                this.checked =
                    !this.checked;

                return;

            }


            const id =
                Number(
                    this.dataset.id
                );


            const target =
                getParticipant(id);


            if (!target) {

                return;

            }


            target.paid =
                this.checked;


            label.textContent =
                this.checked
                    ? "Payé"
                    : "Non payé";


            saveData();

            refreshAllViews();

        }
    );


    return card;

}


/* =========================================================
   PARTICIPANTS PAYÉS
========================================================= */

function afficherParticipantsPayes() {

    if (!adminAuthenticated) {

        return;

    }


    const container =
        document.getElementById(
            "paidContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const paid =
        getPaidParticipants();


    if (paid.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                Aucun paiement reçu.
            </div>

        `;

        return;

    }


    paid.forEach(
        participant => {

            container.appendChild(
                createParticipantAdminCard(
                    participant
                )
            );

        }
    );

}


/* =========================================================
   PARTICIPANTS NON PAYÉS
========================================================= */

function afficherParticipantsNonPayes() {

    if (!adminAuthenticated) {

        return;

    }


    const container =
        document.getElementById(
            "unpaidContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const unpaid =
        getUnpaidParticipants();


    if (unpaid.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                Tous les participants ont payé.
            </div>

        `;

        return;

    }


    unpaid.forEach(
        participant => {

            container.appendChild(
                createParticipantAdminCard(
                    participant
                )
            );

        }
    );

}


/* =========================================================
   COTISATIONS ADMIN
========================================================= */

function afficherCotisations() {

    if (!adminAuthenticated) {

        return;

    }


    const paid =
        getPaidParticipants();

    const unpaid =
        getUnpaidParticipants();


    const paidCount =
        document.getElementById(
            "cotisationPaidCount"
        );


    const unpaidCount =
        document.getElementById(
            "cotisationUnpaidCount"
        );


    if (paidCount) {

        paidCount.textContent =
            `${paid.length} participants`;

    }


    if (unpaidCount) {

        unpaidCount.textContent =
            `${unpaid.length} participants`;

    }


    const paidContainer =
        document.getElementById(
            "cotisationPaidContainer"
        );


    const unpaidContainer =
        document.getElementById(
            "cotisationUnpaidContainer"
        );


    if (
        !paidContainer ||
        !unpaidContainer
    ) {

        return;

    }


    paidContainer.innerHTML = "";

    unpaidContainer.innerHTML = "";


    paid.forEach(
        participant => {

            paidContainer.appendChild(
                createParticipantAdminCard(
                    participant
                )
            );

        }
    );


    unpaid.forEach(
        participant => {

            unpaidContainer.appendChild(
                createParticipantAdminCard(
                    participant
                )
            );

        }
    );

}


/* =========================================================
   BÉNÉFICIAIRES ADMIN
========================================================= */

function afficherBeneficiaires() {

    if (!adminAuthenticated) {

        return;

    }


    const container =
        document.getElementById(
            "beneficiaryDisplay"
        );


    if (!container) {

        return;

    }


    const current =
        getBeneficiaryForMonth(
            "2026-09"
        );


    const next =
        getBeneficiaryForMonth(
            "2026-10"
        );


    container.innerHTML = `

        <div class="beneficiary-card">

            <div class="beneficiary-icon">

                <i class="fa-solid fa-gift"></i>

            </div>


            <div>

                <span>
                    Bénéficiaire de septembre 2026
                </span>

                <strong>
                    ${
                        current
                            ? escapeHtml(
                                current.name
                            )
                            : "À définir"
                    }
                </strong>

                <small>
                    Versement :
                    ${formatEuro(
                        TOTAL_VERSEMENT
                    )}
                </small>

            </div>

        </div>


        <div class="beneficiary-card">

            <div class="beneficiary-icon">

                <i class="fa-solid fa-calendar-plus"></i>

            </div>


            <div>

                <span>
                    Prochain bénéficiaire — octobre 2026
                </span>

                <strong>
                    ${
                        next
                            ? escapeHtml(
                                next.name
                            )
                            : "À définir"
                    }
                </strong>

                <small>
                    Versement :
                    ${formatEuro(
                        TOTAL_VERSEMENT
                    )}
                </small>

            </div>

        </div>

    `;


    remplirSelecteursBeneficiaires();

}


/* =========================================================
   SELECTEURS BÉNÉFICIAIRES
========================================================= */

function remplirSelecteursBeneficiaires() {

    if (!adminAuthenticated) {

        return;

    }


    remplirSelecteurBeneficiaire(
        "beneficiarySelector",
        "2026-09"
    );


    remplirSelecteurBeneficiaire(
        "versementSelector",
        "2026-10"
    );

}


/* =========================================================
   SELECTEUR BÉNÉFICIAIRE
========================================================= */

function remplirSelecteurBeneficiaire(
    selectorId,
    monthKey
) {

    if (!adminAuthenticated) {

        return;

    }


    const selector =
        document.getElementById(
            selectorId
        );


    if (!selector) {

        return;

    }


    selector.innerHTML = `

        <option value="">
            À définir
        </option>

    `;


    participants.forEach(
        participant => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                participant.id;


            option.textContent =
                `${participant.name} — Participant ${participant.id}`;


            const selected =
                getBeneficiaryForMonth(
                    monthKey
                );


            if (
                selected &&
                Number(selected.id) ===
                Number(participant.id)
            ) {

                option.selected =
                    true;

            }


            selector.appendChild(
                option
            );

        }
    );


    selector.onchange =
        function() {

            if (!adminAuthenticated) {

                return;

            }


            setBeneficiaryForMonth(
                monthKey,
                this.value
            );

        };

}


/* =========================================================
   VERSEMENTS ADMIN
========================================================= */

function afficherVersements() {

    if (!adminAuthenticated) {

        return;

    }


    const container =
        document.getElementById(
            "versementBeneficiary"
        );


    if (!container) {

        return;

    }


    const current =
        getBeneficiaryForMonth(
            "2026-09"
        );


    const next =
        getBeneficiaryForMonth(
            "2026-10"
        );


    container.innerHTML = `

        <div class="section-header">

            <div>

                <span class="eyebrow">
                    RÉCAPITULATIF
                </span>

                <h3>
                    Versements
                </h3>

            </div>

        </div>


        <div class="beneficiary-list">

            <div class="beneficiary-card">

                <div class="beneficiary-icon">

                    <i class="fa-solid fa-gift"></i>

                </div>


                <div>

                    <span>
                        Septembre 2026
                    </span>

                    <strong>
                        ${
                            current
                                ? escapeHtml(
                                    current.name
                                )
                                : "À définir"
                        }
                    </strong>

                    <small>
                        Montant :
                        ${formatEuro(
                            TOTAL_VERSEMENT
                        )}
                    </small>

                </div>

            </div>


            <div class="beneficiary-card">

                <div class="beneficiary-icon">

                    <i class="fa-solid fa-calendar-plus"></i>

                </div>


                <div>

                    <span>
                        Octobre 2026
                    </span>

                    <strong>
                        ${
                            next
                                ? escapeHtml(
                                    next.name
                                )
                                : "À définir"
                        }
                    </strong>

                    <small>
                        Montant :
                        ${formatEuro(
                            TOTAL_VERSEMENT
                        )}
                    </small>

                </div>

            </div>

        </div>

    `;


    remplirSelecteursBeneficiaires();

}


/* =========================================================
   PARTICIPANTS ADMIN
========================================================= */

function afficherParticipants() {

    if (!adminAuthenticated) {

        return;

    }


    const container =
        document.getElementById(
            "allParticipantsContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    participants.forEach(
        participant => {

            container.appendChild(
                createParticipantAdminCard(
                    participant
                )
            );

        }
    );

}


/* =========================================================
   HISTORIQUE ADMIN
========================================================= */

function afficherHistorique() {

    if (!adminAuthenticated) {

        return;

    }


    afficherPlanningAdmin();

    afficherHistoriqueDetaille();

}


/* =========================================================
   PLANNING ADMIN
========================================================= */

function afficherPlanningAdmin() {

    if (!adminAuthenticated) {

        return;

    }


    const container =
        document.getElementById(
            "upcomingScheduleContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    TONTEINE_MONTHS.forEach(
        month => {

            const beneficiary =
                getBeneficiaryForMonth(
                    month.key
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "schedule-card";


            card.innerHTML = `

                <div class="schedule-month">

                    <div class="schedule-icon">

                        <i class="fa-solid fa-calendar"></i>

                    </div>


                    <div>

                        <strong>
                            ${month.label}
                        </strong>

                        <span>
                            Versement :
                            ${formatEuro(
                                TOTAL_VERSEMENT
                            )}
                        </span>

                    </div>

                </div>


                <div class="schedule-control">

                    <label>
                        Bénéficiaire
                    </label>


                    <select
                        class="schedule-select"
                        data-month="${month.key}"
                    >

                        <option value="">
                            À définir
                        </option>

                    </select>


                    <div class="schedule-status">

                        ${
                            beneficiary
                                ? "Bénéficiaire défini"
                                : "Bénéficiaire à définir"
                        }

                    </div>

                </div>

            `;


            const select =
                card.querySelector(
                    ".schedule-select"
                );


            participants.forEach(
                participant => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        participant.id;


                    option.textContent =
                        participant.name;


                    if (
                        beneficiary &&
                        Number(
                            beneficiary.id
                        ) ===
                        Number(
                            participant.id
                        )
                    ) {

                        option.selected =
                            true;

                    }


                    select.appendChild(
                        option
                    );

                }
            );


            select.addEventListener(
                "change",
                function() {

                    if (!adminAuthenticated) {

                        return;

                    }


                    setBeneficiaryForMonth(
                        month.key,
                        this.value
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   HISTORIQUE DÉTAILLÉ ADMIN
========================================================= */

function afficherHistoriqueDetaille() {

    if (!adminAuthenticated) {

        return;

    }


    const container =
        document.getElementById(
            "historyDetailedContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const septemberBeneficiary =
        getBeneficiaryForMonth(
            "2026-09"
        );


    const paidCount =
        getPaidParticipants().length;


    const collected =
        getTotalCollected();


    const allPaid =
        paidCount ===
        TOTAL_PARTICIPANTS;


    const historyCard =
        document.createElement(
            "div"
        );


    historyCard.className =
        "history-detail-card";


    historyCard.innerHTML = `

        <div class="history-detail-header">

            <div>

                <span class="eyebrow">
                    SEPTEMBRE 2026
                </span>

                <h4>
                    Versement mensuel
                </h4>

                <p>
                    Historique du mois
                </p>

            </div>


            <div class="history-status ${allPaid ? "paid" : "pending"}">

                <i class="fa-solid ${allPaid ? "fa-check" : "fa-clock"}"></i>

                ${
                    allPaid
                        ? "Cotisations reçues"
                        : "Cotisations en cours"
                }

            </div>

        </div>


        <div class="history-detail-beneficiary">

            <i class="fa-solid fa-gift"></i>

            <div>

                <span>
                    Bénéficiaire
                </span>

                <strong>
                    ${
                        septemberBeneficiary
                            ? escapeHtml(
                                septemberBeneficiary.name
                            )
                            : "À définir"
                    }
                </strong>

            </div>

        </div>


        <div class="history-detail-grid">

            <div class="history-detail-item">

                <span>
                    Cotisation individuelle
                </span>

                <strong>
                    ${formatEuro(
                        COTISATION
                    )}
                </strong>

            </div>


            <div class="history-detail-item">

                <span>
                    Participants
                </span>

                <strong>
                    ${TOTAL_PARTICIPANTS}
                </strong>

            </div>


            <div class="history-detail-item">

                <span>
                    Montant du versement
                </span>

                <strong>
                    ${formatEuro(
                        TOTAL_VERSEMENT
                    )}
                </strong>

            </div>


            <div class="history-detail-item">

                <span>
                    Total collecté
                </span>

                <strong>
                    ${formatEuro(
                        collected
                    )}
                </strong>

            </div>


            <div class="history-detail-item">

                <span>
                    Cotisations reçues
                </span>

                <strong>
                    ${paidCount} / ${TOTAL_PARTICIPANTS}
                </strong>

            </div>


            <div class="history-detail-item">

                <span>
                    Date limite
                </span>

                <strong>
                    15 septembre
                </strong>

            </div>

        </div>


        <div class="history-detail-footer">

            <span>
                Chaque participant :
                ${formatEuro(COTISATION)}
            </span>

            <span>
                Versement :
                ${formatEuro(TOTAL_VERSEMENT)}
            </span>

        </div>

    `;


    container.appendChild(
        historyCard
    );


    TONTEINE_MONTHS
        .filter(
            month =>
                month.key !== "2026-09"
        )
        .forEach(
            month => {

                const beneficiary =
                    getBeneficiaryForMonth(
                        month.key
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "history-detail-card";


                card.innerHTML = `

                    <div class="history-detail-header">

                        <div>

                            <span class="eyebrow">
                                ${month.label.toUpperCase()}
                            </span>

                            <h4>
                                Versement prévu
                            </h4>

                            <p>
                                Planning de la tontine
                            </p>

                        </div>

                    </div>


                    <div class="history-detail-beneficiary">

                        <i class="fa-solid fa-gift"></i>

                        <div>

                            <span>
                                Bénéficiaire
                            </span>

                            <strong>
                                ${
                                    beneficiary
                                        ? escapeHtml(
                                            beneficiary.name
                                        )
                                        : "À définir"
                                }
                            </strong>

                        </div>

                    </div>


                    <div class="history-detail-grid">

                        <div class="history-detail-item">

                            <span>
                                Cotisation
                            </span>

                            <strong>
                                ${formatEuro(
                                    COTISATION
                                )}
                            </strong>

                        </div>


                        <div class="history-detail-item">

                            <span>
                                Versement prévu
                            </span>

                            <strong>
                                ${formatEuro(
                                    TOTAL_VERSEMENT
                                )}
                            </strong>

                        </div>


                        <div class="history-detail-item">

                            <span>
                                Date limite
                            </span>

                            <strong>
                                Le 15
                            </strong>

                        </div>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );

}


/* =========================================================
   MODE PARTICIPANT / ADMIN
========================================================= */

function setupModeButton() {

    const button =
        document.getElementById(
            "switchModeButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function() {

            if (
                currentMode ===
                "admin"
            ) {

                setParticipantMode();

            }

            else {

                if (
                    requestAdminPassword()
                ) {

                    setAdminMode();

                }

            }

        }
    );

}


/* =========================================================
   MODE PARTICIPANT
========================================================= */

function setParticipantMode() {

    currentMode =
        "participant";


    adminAuthenticated =
        false;


    const adminArea =
        document.getElementById(
            "adminArea"
        );


    const participantArea =
        document.getElementById(
            "participantArea"
        );


    const adminNavigation =
        document.getElementById(
            "adminNavigation"
        );


    const participantNavigation =
        document.getElementById(
            "participantNavigation"
        );


    const button =
        document.getElementById(
            "switchModeButton"
        );


    const modeLabel =
        document.getElementById(
            "currentModeLabel"
        );


    const roleBadge =
        document.getElementById(
            "roleBadgeText"
        );


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    if (adminArea) {

        adminArea.classList.add(
            "hidden"
        );

    }


    if (participantArea) {

        participantArea.classList.remove(
            "hidden"
        );

    }


    if (adminNavigation) {

        adminNavigation.classList.add(
            "hidden"
        );

    }


    if (participantNavigation) {

        participantNavigation.classList.remove(
            "hidden"
        );

    }


    if (button) {

        button.innerHTML = `

            <i class="fa-solid fa-shield-halved"></i>

            <span>
                Accès administrateur
            </span>

        `;

    }


    if (modeLabel) {

        modeLabel.textContent =
            "Participant";

    }


    if (roleBadge) {

        roleBadge.textContent =
            "Participant";

    }


    if (pageTitle) {

        pageTitle.textContent =
            "Mon espace";

    }


    document
        .querySelectorAll(
            ".participant-menu-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    const home =
        document.querySelector(
            '[data-participant-page="participant-home"]'
        );


    if (home) {

        home.classList.add(
            "active"
        );

    }


    updateParticipantPublicArea();

}


/* =========================================================
   RETOUR ADMIN
========================================================= */

function setAdminMode() {

    if (!adminAuthenticated) {

        if (
            !requestAdminPassword()
        ) {

            return;

        }

    }


    currentMode =
        "admin";


    const adminArea =
        document.getElementById(
            "adminArea"
        );


    const participantArea =
        document.getElementById(
            "participantArea"
        );


    const adminNavigation =
        document.getElementById(
            "adminNavigation"
        );


    const participantNavigation =
        document.getElementById(
            "participantNavigation"
        );


    const button =
        document.getElementById(
            "switchModeButton"
        );


    const modeLabel =
        document.getElementById(
            "currentModeLabel"
        );


    const roleBadge =
        document.getElementById(
            "roleBadgeText"
        );


    if (adminArea) {

        adminArea.classList.remove(
            "hidden"
        );

    }


    if (participantArea) {

        participantArea.classList.add(
            "hidden"
        );

    }


    if (adminNavigation) {

        adminNavigation.classList.remove(
            "hidden"
        );

    }


    if (participantNavigation) {

        participantNavigation.classList.add(
            "hidden"
        );

    }


    if (button) {

        button.innerHTML = `

            <i class="fa-solid fa-user-group"></i>

            <span>
                Passer en mode participant
            </span>

        `;

    }


    if (modeLabel) {

        modeLabel.textContent =
            "Administrateur";

    }


    if (roleBadge) {

        roleBadge.textContent =
            "Administrateur";

    }


    afficherPageAdmin(
        "dashboard"
    );

}


/* =========================================================
   NAVIGATION PARTICIPANT
========================================================= */

function setupParticipantNavigation() {

    document
        .querySelectorAll(
            ".participant-menu-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();


                        const page =
                            this.dataset
                                .participantPage;


                        afficherPageParticipant(
                            page
                        );

                    }
                );

            }
        );

}


/* =========================================================
   PAGE PARTICIPANT
========================================================= */

function afficherPageParticipant(page) {

    const pages = {

        "participant-home":
            "participantHomePage",

        "participant-info":
            "participantInfoPage"

    };


    Object.values(pages)
        .forEach(
            id => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.style.display =
                        "none";

                }

            }
        );


    const target =
        document.getElementById(
            pages[page]
        );


    if (target) {

        target.style.display =
            "block";

    }


    document
        .querySelectorAll(
            ".participant-menu-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    const active =
        document.querySelector(
            `[data-participant-page="${page}"]`
        );


    if (active) {

        active.classList.add(
            "active"
        );

    }


    const title =
        document.getElementById(
            "pageTitle"
        );


    if (title) {

        title.textContent =
            page === "participant-info"
                ? "Informations"
                : "Mon espace";

    }


    if (
        page ===
        "participant-home"
    ) {

        updateParticipantPublicArea();

    }

}


/* =========================================================
   ESPACE PARTICIPANT PUBLIC
========================================================= */

function updateParticipantPublicArea() {

    const current =
        getBeneficiaryForMonth(
            "2026-09"
        );


    const next =
        getBeneficiaryForMonth(
            "2026-10"
        );


    const paidCount =
        getPaidParticipants().length;


    const totalCollected =
        getTotalCollected();


    /* =====================================================
       BÉNÉFICIAIRE SEPTEMBRE
    ====================================================== */

    const currentContainer =
        document.getElementById(
            "participantCurrentBeneficiary"
        );


    if (currentContainer) {

        currentContainer.innerHTML = `

            <span class="public-label">
                Bénéficiaire de septembre 2026
            </span>


            <div class="public-name">

                ${
                    current
                        ? escapeHtml(
                            current.name
                        )
                        : "À définir"
                }

            </div>


            <span class="public-amount">

                Montant du versement :
                ${formatEuro(
                    TOTAL_VERSEMENT
                )}

            </span>

        `;

    }


    /* =====================================================
       BÉNÉFICIAIRE OCTOBRE
    ====================================================== */

    const nextContainer =
        document.getElementById(
            "participantNextBeneficiary"
        );


    if (nextContainer) {

        nextContainer.innerHTML = `

            <span class="public-label">
                Prochain bénéficiaire —
                octobre 2026
            </span>


            <div class="public-name">

                ${
                    next
                        ? escapeHtml(
                            next.name
                        )
                        : "À définir"
                }

            </div>


            <span class="public-amount">

                Montant prévu :
                ${formatEuro(
                    TOTAL_VERSEMENT
                )}

            </span>

        `;

    }


    /* =====================================================
       NOMBRE DE PARTICIPANTS AYANT COTISÉ
    ====================================================== */

    const status =
        document.getElementById(
            "participantPaymentStatus"
        );


    if (status) {

        const percentage =
            TOTAL_PARTICIPANTS === 0
                ? 0
                : Math.round(
                    (
                        paidCount /
                        TOTAL_PARTICIPANTS
                    ) * 100
                );


        status.className =
            "payment-status paid-status";


        status.innerHTML = `

            <i class="fa-solid fa-check"></i>

            <div>

                <strong>
                    ${paidCount} / ${TOTAL_PARTICIPANTS}
                    participants ont cotisé
                </strong>

                <span>
                    ${formatEuro(totalCollected)}
                    reçus sur
                    ${formatEuro(TOTAL_VERSEMENT)}
                </span>

                <small>
                    ${percentage}% des cotisations reçues
                </small>

            </div>

        `;

    }


    /* =====================================================
       PLANNING PUBLIC
    ====================================================== */

    afficherPlanningPublic();


    /* =====================================================
       HISTORIQUE PUBLIC
    ====================================================== */

    afficherHistoriquePublic();

}


/* =========================================================
   PLANNING PUBLIC
========================================================= */

function afficherPlanningPublic() {

    const container =
        document.getElementById(
            "participantUpcomingSchedule"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    TONTEINE_MONTHS.forEach(
        month => {

            const beneficiary =
                getBeneficiaryForMonth(
                    month.key
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "public-schedule-item";


            item.innerHTML = `

                <div>

                    <strong>
                        ${month.label}
                    </strong>

                    <span>

                        ${
                            beneficiary
                                ? "Bénéficiaire : " +
                                  escapeHtml(
                                      beneficiary.name
                                  )
                                : "Bénéficiaire à définir"
                        }

                    </span>

                </div>


                <div class="public-schedule-amount">

                    ${formatEuro(
                        TOTAL_VERSEMENT
                    )}

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   HISTORIQUE PUBLIC
========================================================= */

function afficherHistoriquePublic() {

    const container =
        document.getElementById(
            "participantHistoryContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    TONTEINE_MONTHS.forEach(
        month => {

            const beneficiary =
                getBeneficiaryForMonth(
                    month.key
                );


            const paidCount =
                getPaidParticipants().length;


            const totalCollected =
                getTotalCollected();


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "public-history-card";


            card.innerHTML = `

                <div class="public-history-header">

                    <div>

                        <strong>
                            ${month.label}
                        </strong>

                        <span>
                            Versement mensuel
                        </span>

                    </div>

                    <i class="fa-solid fa-clock-rotate-left"></i>

                </div>


                <div class="public-history-info">

                    <div>

                        <span>
                            Bénéficiaire
                        </span>

                        <strong>
                            ${
                                beneficiary
                                    ? escapeHtml(
                                        beneficiary.name
                                    )
                                    : "À définir"
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Versement
                        </span>

                        <strong>
                            ${formatEuro(
                                TOTAL_VERSEMENT
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Cotisations reçues
                        </span>

                        <strong>
                            ${paidCount} / ${TOTAL_PARTICIPANTS}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Total reçu
                        </span>

                        <strong>
                            ${formatEuro(
                                totalCollected
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Date limite
                        </span>

                        <strong>
                            Le 15
                        </strong>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   SÉLECTEUR DE MOIS
========================================================= */

function remplirSelecteurMois() {

    const selector =
        document.getElementById(
            "monthSelector"
        );


    if (!selector) {

        return;

    }


    selector.innerHTML = "";


    TONTEINE_MONTHS.forEach(
        (month, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                month.key;


            option.textContent =
                month.label;


            if (index === 0) {

                option.selected =
                    true;

            }


            selector.appendChild(
                option
            );

        }
    );


    selector.addEventListener(
        "change",
        function() {

            const selected =
                TONTEINE_MONTHS.find(
                    month =>
                        month.key ===
                        this.value
                );


            const progressTitle =
                document.getElementById(
                    "progressTitle"
                );


            if (
                progressTitle &&
                selected
            ) {

                progressTitle.textContent =
                    `Cotisations de ${
                        selected.label.toLowerCase()
                    }`;

            }

        }
    );

}


/* =========================================================
   RAFRAÎCHIR TOUT
========================================================= */

function refreshAllViews() {

    if (adminAuthenticated) {

        updateDashboard();

        afficherCotisations();

        afficherVersements();

        afficherParticipants();

        afficherHistorique();

    }


    updateParticipantPublicArea();

}


/* =========================================================
   PROTECTION HTML
========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadData();

        saveData();


        setupAdminNavigation();

        setupParticipantNavigation();

        setupModeButton();


        remplirSelecteurMois();


        /*
            DÉMARRAGE EN MODE PARTICIPANT
        */

        setParticipantMode();


        updateParticipantPublicArea();

    }
);