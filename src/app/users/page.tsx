import UserList from "@/components/userList";

function UsersPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-6 sm:p-24 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      <div className="w-full mt-6 flex justify-center">
        <UserList />
      </div>
    </main>
  );
}

export default UsersPage;
