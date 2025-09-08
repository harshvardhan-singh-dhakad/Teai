import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const users = [
    { name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
    { name: "Bob Williams", email: "bob@example.com", role: "User", status: "Active" },
    { name: "Charlie Brown", email: "charlie@example.com", role: "User", status: "Inactive" },
    { name: "Diana Prince", email: "diana@example.com", role: "User", status: "Active" },
]

const agents = [
    { name: "Sales Bot", owner: "Alice Johnson", status: "Published", calls: 1204 },
    { name: "Support Assistant", owner: "Bob Williams", status: "Published", calls: 850 },
    { name: "Real Estate Draft", owner: "Diana Prince", status: "Draft", calls: 0 },
    { name: "Healthcare Info", owner: "Alice Johnson", status: "Published", calls: 2310 },
]

export default function AdminPage() {
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Admin Panel</CardTitle>
                <CardDescription>Manage users and agents across the platform.</CardDescription>
            </CardHeader>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.email}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                <TableCell>
                                <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'} className={user.status === 'Active' ? 'text-green-400 border-green-400' : ''}>
                                    {user.status}
                                </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-headline">Agent Management</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Calls</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {agents.map(agent => (
                            <TableRow key={agent.name}>
                                <TableCell className="font-medium">{agent.name}</TableCell>
                                <TableCell>{agent.owner}</TableCell>
                                <TableCell>
                                    <Badge variant={agent.status === 'Published' ? 'default' : 'secondary'} className={agent.status === 'Published' ? 'bg-green-500/20 text-green-400 border-transparent hover:bg-green-500/30' : ''}>
                                        {agent.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{agent.calls.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
