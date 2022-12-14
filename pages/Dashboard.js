import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import moment from "moment";
import FeatherIcon from "react-native-vector-icons/Feather";

import {
  Profile,
  Amount,
  TransactionContainer,
  TransactionItem,
  Refresh,
  Button,
} from "../components";

import { useUserContext } from "../hooks";
import { deleteItem } from "../utils/SecureStore";
import { countTotal } from "../utils/countTotal";
import { useCafe, useStudent, useTransaction } from "../hooks";

import { globals, dashboardStyle } from "../styles";

const Dashboard = ({ navigation }) => {
  const { user, setUser } = useUserContext();
  const [total, setTotal] = useState(0);
  const { cafe } = useCafe({ id: user.id, student: user.student });
  const { students } = useStudent({
    id: user.id,
    student: user.student,
    refresh: user.dashboard.refresh,
  });
  const { transactions } = useTransaction({
    id: user.id,
    refresh: user.dashboard.refresh,
    student: user.student,
  });

  const onNavigate = () => {
    user.student
      ? navigation.navigate("Pay")
      : navigation.navigate("My QRCode");
  };

  const onLogout = async () => {
    await deleteItem("accessToken");
    await deleteItem("refreshToken");
    await deleteItem("id");
    await deleteItem("login");
    await deleteItem("student");
    setUser(prev => ({
      ...prev,
      id: undefined,
      login: false,
      student: false,
    }));
  };

  useEffect(() => {
    transactions && setTotal(countTotal(transactions));
  }, [transactions]);

  return (
    <View style={[globals.container, { paddingTop: 16 }]}>
      <Refresh dashboard={true}>
        <View style={dashboardStyle.logoutContainer}>
          <Profile
            textField1={cafe[0]?.cafe_name || students[0]?.student_name}
            textField2={cafe[0]?.username || students[0]?.matric_no}
            onLogout={onLogout}
          />
        </View>
        <View style={{ marginTop: 24 }}>
          <Amount
            amount={user.student ? students[0]?.wallet_amount : total}
            student={user.student}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <Button
            label={user.student ? "Pay" : "My QRCode"}
            onPress={onNavigate}
          />
        </View>
        <View style={{ marginTop: 40, marginBottom: 24 }}>
          <View style={[dashboardStyle.transactionHeaderWrap]}>
            <Text style={dashboardStyle.transactionHeader}>
              Recent transaction
            </Text>
            <FeatherIcon
              name="more-horizontal"
              size={25}
              onPress={() => navigation.navigate("Transactions")}
            />
          </View>
          <TransactionContainer>
            {transactions &&
              transactions
                .slice(0, 3)
                .map(
                  (
                    {
                      sender,
                      amount,
                      created_at,
                      transaction_id,
                      cafe_name,
                      student_name,
                    },
                    i
                  ) => {
                    let details = {
                      sender: `${student_name} (${sender})`,
                      recipient: cafe_name,
                      transactionId: transaction_id,
                      amount: `RM${amount}`,
                      date: `${moment(created_at).format(
                        "D-MM-YYYY"
                      )} at ${moment(created_at).format("h.mma")}`,
                    };

                    return (
                      <TransactionItem
                        key={i}
                        field1={sender}
                        time={moment(created_at).format("h.mma")}
                        date={moment(created_at).format("D-MM")}
                        amount={amount}
                        noBorder={i == 0 && true}
                        cafe={!user.student}
                        navigate={() =>
                          navigation.navigate("Transaction Details", {
                            data: details,
                          })
                        }
                      />
                    );
                  }
                )}
          </TransactionContainer>
        </View>
      </Refresh>
    </View>
  );
};

export default Dashboard;
