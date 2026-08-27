<?php

namespace App\Enums;

enum TeamPermission: string
{
    case UpdateTeam = 'team:update';
    case DeleteTeam = 'team:delete';

    case AddMember = 'member:add';
    case UpdateMember = 'member:update';
    case RemoveMember = 'member:remove';

    case CreateInvitation = 'invitation:create';
    case CancelInvitation = 'invitation:cancel';

    // Business module permissions
    case ManageClients = 'clients:manage';
    case ManageServices = 'services:manage';
    case ManageBookings = 'bookings:manage';
    case ManageBilling = 'billing:manage';
    case ManageInventory = 'inventory:manage';
    case ViewReports = 'reports:view';
}
