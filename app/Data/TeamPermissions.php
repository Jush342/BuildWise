<?php

namespace App\Data;

readonly class TeamPermissions
{
    public function __construct(
        public bool $canUpdateTeam,
        public bool $canDeleteTeam,
        public bool $canAddMember,
        public bool $canUpdateMember,
        public bool $canRemoveMember,
        public bool $canCreateInvitation,
        public bool $canCancelInvitation,
        public bool $canManageClients,
        public bool $canManageServices,
        public bool $canManageBookings,
        public bool $canManageBilling,
        public bool $canManageInventory,
        public bool $canViewReports,
    ) {}
}
